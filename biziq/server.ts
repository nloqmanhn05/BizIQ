import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import multer from "multer";
import { randomUUID } from "crypto";
import os from "os";
import fs from "fs";
import { parseFile } from "./src/lib/dataParser";
import { computeSimulation } from "./src/lib/simulatorEngine";
import { setSession, getSession } from "./src/lib/sessionStore";
import XLSX from "xlsx";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists (local to project to avoid Windows tmp path issues)
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  }
});
const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log("\n" + "=".repeat(50));
  console.log("🚀 BIZIQ SERVER STARTING...");
  console.log(`➜  Local:   http://localhost:${PORT}/`);
  console.log("=".repeat(50) + "\n");

  console.log("📦 Loading environment & AI clients...");
  app.use(express.json());

  // AI Client setup
  const ai = new OpenAI({
    apiKey: process.env.AI_API_KEY || process.env.GEMINI_API_KEY,
    baseURL: process.env.AI_BASE_URL || "https://api.openai.com/v1",
  });

  async function createCompletionWithTimeout(messages: { role: string; content: string }[]) {
    const model = process.env.AI_MODEL || "gpt-4o-mini";
    return Promise.race([
      ai.chat.completions.create({
        model: model,
        messages: messages as never,
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("AI provider timeout after 180 seconds")), 180000);
      }),
    ]);
  }

  async function callGLM(messages: { role: string; content: string }[]): Promise<string> {
    const response = await createCompletionWithTimeout(messages);
    return response.choices[0].message.content || "";
  }

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Chat API route — streaming via Server-Sent Events
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, businessContext } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      const model = process.env.AI_MODEL || "gpt-4o-mini";

      // Set SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      // Keep-alive heartbeat to prevent timeouts while waiting for first token
      const heartbeat = setInterval(() => {
        res.write(": keep-alive\n\n");
      }, 15000);

      const stream = await ai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are BizIQ, a concise business data assistant. Use the provided business context first when answering. If context is missing, say what is missing and ask a short follow-up question.",
          },
          ...(typeof businessContext === "string" && businessContext.trim()
            ? [{ role: "user", content: `Business Context:\n${businessContext}` }]
            : []),
          { role: "user", content: `User Question: ${message}` },
        ] as never,
        stream: true,
        max_tokens: 1024,
      });

      clearInterval(heartbeat);

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (error) {
      console.error("Error calling AI API:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate AI response" });
      } else {
        res.write(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : "Stream error" })}\n\n`);
        res.end();
      }
    }
  });

  // POST /api/upload
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const industry = req.body.industry || "F&B";
      const sessionId = randomUUID();

      const parsedData = parseFile(req.file.path);
      const decisions: any[] = []; // Deterministic decisions can be added here if needed later

      setSession(sessionId, {
        sessionId,
        uploadedAt: new Date(),
        parsedData,
        decisions,
        industry,
      });

      const baselineParams = { priceChangePct: 0, cogsChangePct: 0, marketingChangePct: 0 };
      const initialSimResult = computeSimulation(parsedData, baselineParams);

      res.json({
        sessionId,
        previewKPIs: {
          totalRevenueRM: parsedData.totalRevenueRM,
          grossMarginPct: parsedData.grossMarginPct,
          bestLocation: parsedData.bestLocation,
          worstLocation: parsedData.worstLocation,
          totalTransactions: parsedData.totalTransactions,
          dateRange: parsedData.dateRange,
          yoyGrowthPct: parsedData.yoyGrowthPct,
          realRevenueRM: parsedData.realRevenueRM,
          profitFirstStatus: parsedData.profitFirstStatus,
        },
        baselineSimulation: initialSimResult,
        decisionsCount: decisions.length,
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({
        error: "Upload failed",
        detail: err instanceof Error ? err.message : "Unknown error",
      });
    }
  });

  // GET /api/decisions/:sessionId
  app.get("/api/decisions/:sessionId", (req, res) => {
    const session = getSession(req.params.sessionId);
    if (!session) return res.status(404).json({ error: "Session not found. Please re-upload your file." });
    res.json({
      decisions: session.decisions,
      summary: {
        totalRevenueRM: session.parsedData.totalRevenueRM,
        grossMarginPct: session.parsedData.grossMarginPct,
        bestLocation: session.parsedData.bestLocation,
        worstLocation: session.parsedData.worstLocation,
        revenueByLocation: session.parsedData.revenueByLocation,
        revenueByChannel: session.parsedData.revenueByChannel,
        yoyGrowthPct: session.parsedData.yoyGrowthPct,
        anomalies: session.parsedData.anomalies,
      },
    });
  });

  // POST /api/simulator/:sessionId
  app.post("/api/simulator/:sessionId", async (req, res) => {
    try {
      const session = getSession(req.params.sessionId);
      if (!session) return res.status(404).json({ error: "Session not found. Please re-upload your file." });

      const params = {
        priceChangePct: Number(req.body.priceChangePct) || 0,
        cogsChangePct: Number(req.body.cogsChangePct) || 0,
        marketingChangePct: Number(req.body.marketingChangePct) || 0,
      };

      const result = computeSimulation(session.parsedData, params);
      res.json(result);
    } catch (err) {
      console.error("Simulator error:", err);
      res.status(500).json({
        error: "Simulation failed",
        detail: err instanceof Error ? err.message : "Unknown error",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("📦 Initializing Vite dev server...");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          port: 0, // Uses a random available port to avoid '24678 in use' errors
        }
      },
      appType: "spa",
      clearScreen: false,
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Graceful server start with port-in-use handling
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log("✅ Server is listening and ready for requests!\n");
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\nError: Port ${PORT} is already in use.`);
      console.error(`Fix: Run "taskkill /F /IM node.exe" in a terminal, then try again.\n`);
    } else {
      console.error("Server error:", err);
    }
    process.exit(1);
  });
}

// Prevent crashes from unhandled errors
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

startServer();
