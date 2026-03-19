const { OpenAI } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Sends a message to the OpenAI API and streams the response.
 * @param {string} userPrompt The current user's message.
 * @param {Array<{role: string, content: string}>} history Conversation history.
 * @returns {AsyncGenerator<string>} An async generator that yields response chunks.
 */
async function* sendMessage(userPrompt, history) {
  try {
    // OpenAI's chat completions API expects an array of message objects.
    // The history is already in the correct format { role: 'user'/'assistant', content: '...' }.
    const messages = [...history, { role: 'user', content: userPrompt }];

    const response = await openai.chat.completions.create({
      model: 'gpt-4', // Or 'gpt-3.5-turbo'
      messages: messages,
      stream: true,
    });

    for await (const chunk of response) {
      // Check if content exists before yielding
      if (chunk.choices[0].delta && chunk.choices[0].delta.content) {
        yield chunk.choices[0].delta.content;
      }
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

module.exports = { sendMessage };
