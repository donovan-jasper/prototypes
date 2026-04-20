require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function* sendMessage(prompt, conversationHistory = []) {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY is not set. Using mock response for OpenAI.");
    const mockResponse = "I am a mock OpenAI agent. Please set OPENAI_API_KEY in your .env file to enable real AI interactions.";
    for (let i = 0; i < mockResponse.length; i++) {
      yield mockResponse[i];
      await new Promise(resolve => setTimeout(resolve, 20)); // Simulate typing
    }
    return;
  }

  const messages = conversationHistory.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }));
  messages.push({ role: 'user', content: prompt });

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      stream: true,
    });

    for await (const chunk of stream) {
      yield chunk.choices[0]?.delta?.content || "";
    }
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    yield `Error: Could not get response from OpenAI. ${error.message}`;
  }
}

module.exports = { sendMessage };
