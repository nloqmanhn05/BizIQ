import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

const ai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL,
});

async function testNonStream() {
  console.log("Testing NON-stream with model:", process.env.AI_MODEL);
  try {
    const res = await ai.chat.completions.create({
      model: process.env.AI_MODEL || "ilmu-glm-5.1",
      messages: [{ role: "user", content: "Say 'Hello, I am working' briefly." }],
      stream: false,
    });

    console.log("Response:", res.choices[0].message.content);
    console.log("Success!");
  } catch (err) {
    console.error("Failed:", err);
  }
}

testNonStream();
