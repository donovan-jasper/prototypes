require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function* sendMessage(prompt, conversationHistory = []) {
  if (!process.env.GOOGLE_API_KEY) {
    console.warn("GOOGLE_API_KEY is not set. Using mock response for Gemini.");
    const mockResponse = "I am a mock Gemini agent. Please set GOOGLE_API_KEY in your .env file to enable real AI interactions.";
    for (let i = 0; i < mockResponse.length; i++) {
      yield mockResponse[i];
      await new Promise(resolve => setTimeout(resolve, 20)); // Simulate typing
    }
    return;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  // Gemini API expects history in a specific format, alternating user/model
  const history = [];
  for (let i = 0; i < conversationHistory.length; i++) {
    const msg = conversationHistory[i];
    if (msg.role === 'user') {
      history.push({ role: 'user', parts: [{ text: msg.content }] });
    } else if (msg.role === 'assistant') {
      history.push({ role: 'model', parts: [{ text: msg.content }] });
    }
  }

  try {
    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 1024,
      },
    });

    const result = await chat.sendMessageStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        yield chunkText;
      }
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    yield `Error: Could not get response from Gemini. ${error.message}`;
  }
}

module.exports = { sendMessage };
