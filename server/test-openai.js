import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

async function testDeepSeek() {
  try {
    const res = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        messages: [
          { role: "system", content: "You are a test agent." },
          { role: "user", content: "Say hello if the API key works." },
        ],
        max_tokens: 10,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("✅ DeepSeek API key is valid! Response:", res.data.choices[0].message.content);
  } catch (err) {
    console.error("❌ DeepSeek API test failed:", err?.response?.data || err.message);
  }
}

testDeepSeek();
