import { OpenAI } from "openai";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

async function testConnection() {
  console.log("🚀 Testing connection to ilmu.ai...");
  console.log("Base URL:", process.env.AI_BASE_URL);
  console.log("Model:", process.env.AI_MODEL);

  const apiKey = process.env.AI_API_KEY;

  if (!apiKey || apiKey === "YOUR_ILMU_API_KEY") {
    console.error("❌ Error: You haven't set your AI_API_KEY in the .env file yet!");
    return;
  }

  const ai = new OpenAI({
    apiKey: apiKey,
    baseURL: process.env.AI_BASE_URL,
  });

  try {
    const response = await ai.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "user", content: "Say 'Connection Successful' if you can hear me." }
      ],
    });

    console.log("✅ Response from AI:");
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error("❌ Failed to connect:");
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  }
}

testConnection();
