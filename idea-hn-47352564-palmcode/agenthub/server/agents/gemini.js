const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * Sends a message to the Google Gemini API and streams the response.
 * @param {string} userPrompt The current user's message.
 * @param {Array<{role: string, content: string}>} history Conversation history.
 * @returns {AsyncGenerator<string>} An async generator that yields response chunks.
 */
async function* sendMessage(userPrompt, history) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Convert history to Gemini's format: [{ role: 'user', parts: [{ text: '...' }] }, { role: 'model', parts: [{ text: '...' }] }]
    const geminiHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role, // Gemini uses 'model' for assistant role
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: geminiHistory,
    });

    const response = await chat.sendMessageStream(userPrompt);

    for await (const chunk of response.stream) {
      yield chunk.text();
    }
  } catch (error) {
    console.error('Error calling Google Generative AI API:', error);
    throw error;
  }
}

module.exports = { sendMessage };
