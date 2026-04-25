import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  const ai = new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: process.env.AI_BASE_URL || "https://api.openai.com/v1",
  });

  try {
    console.log("Testing AI connection with model:", process.env.AI_MODEL);
    const stream = await ai.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: "Hello, say 'Test OK'" }],
      stream: true,
    });

    console.log("Stream received. Waiting for chunks...");
    for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }
    console.log("\nTest completed successfully.");
  } catch (err) {
    console.error("AI Test failed:", err);
  }
}

test();
