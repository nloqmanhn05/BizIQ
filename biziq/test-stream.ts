import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

const ai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL,
});

async function testStream() {
  console.log("Testing stream with model:", process.env.AI_MODEL);
  try {
    const stream = await ai.chat.completions.create({
      model: process.env.AI_MODEL || "ilmu-glm-5.1",
      messages: [{ role: "user", content: "Say 'Hello, I am working' briefly." }],
      stream: true,
    });

    console.log("Stream started, waiting for chunks...");
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        process.stdout.write(content);
      }
    }
    console.log("\nStream finished successfully!");
  } catch (err) {
    console.error("\nStream failed:", err);
  }
}

testStream();
