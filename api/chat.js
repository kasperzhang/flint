import axios from "axios";

const SYSTEM_PROMPT = `You are a conversational product thinking assistant helping users turn their vague app or product ideas into a clear and structured Product Requirements Document (PRD).
Your job is to guide the user step by step, using short, friendly, and clear questions.
You must not generate the full PRD at once. Instead, guide the user through key sections one at a time:
1. Problem / User Pain
2. Target Users
3. User Goals
4. Key Features
5. Success Metrics
6. Constraints or Assumptions
For each section:
* Ask 1 clear guiding question
* Wait for the user's response
* Summarize or reflect back what they said in a concise way
* Then offer 2–3 optional follow-up questions that could deepen or expand their thinking
If the user seems stuck, give them an example from a popular app (e.g. Spotify, Duolingo, Notion).
Your tone should be supportive, focused, and collaborative — not overly technical.`;

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Received request with body:', JSON.stringify(req.body, null, 2));
  
  const { messages } = req.body;
  
  if (!Array.isArray(messages)) {
    const error = "Invalid messages format: Expected array";
    console.error(error);
    return res.status(400).json({ error });
  }

  try {
    const openaiRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 800,
        temperature: 0.7,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    const aiMessage = openaiRes.data.choices[0].message;
    res.status(200).json({ message: aiMessage });
  } catch (err) {
    console.error('Error in /api/chat:', {
      message: err.message,
      response: err.response?.data,
      stack: err.stack
    });
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}
