const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function* sendMessage(prompt, conversationHistory) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const chat = model.startChat({
      history: conversationHistory,
    });

    const response = await chat.sendMessageStream(prompt);

    for await (const chunk of response.stream) {
      yield chunk.text();
    }
  } catch (error) {
    console.error('Error calling Google Generative AI API:', error);
    throw error;
  }
}

module.exports = { sendMessage };
