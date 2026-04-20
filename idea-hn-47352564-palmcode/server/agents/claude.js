require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function* sendMessage(prompt, conversationHistory = []) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY is not set. Using mock response for Claude.");
    const mockResponse = "I am a mock Claude agent. Please set ANTHROPIC_API_KEY in your .env file to enable real AI interactions.";
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
    const stream = anthropic.messages.stream({
      model: "claude-3-opus-20240229", // Or another suitable Claude model
      max_tokens: 1024,
      messages: messages,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield chunk.delta.text;
      }
    }
  } catch (error) {
    console.error("Error calling Claude API:", error);
    yield `Error: Could not get response from Claude. ${error.message}`;
  }
}

module.exports = { sendMessage };
