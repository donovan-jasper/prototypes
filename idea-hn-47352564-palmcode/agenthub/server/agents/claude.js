const Anthropic = require('@anthropic-ai/sdk');
const dotenv = require('dotenv');

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Sends a message to the Claude API and streams the response.
 * @param {string} userPrompt The current user's message.
 * @param {Array<{role: string, content: string}>} history Conversation history.
 * @returns {AsyncGenerator<string>} An async generator that yields response chunks.
 */
async function* sendMessage(userPrompt, history) {
  try {
    // Convert history array to Claude's prompt format: "Human: ...\nAssistant: ..."
    let claudePrompt = '';
    for (const msg of history) {
      if (msg.role === 'user') {
        claudePrompt += `Human: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        claudePrompt += `Assistant: ${msg.content}\n`;
      }
      // Ignore other roles like 'system' if they exist, as Claude's API doesn't directly support them in this format.
    }
    // Append the current user prompt and the Assistant's turn
    claudePrompt += `Human: ${userPrompt}\nAssistant:`;

    const response = await anthropic.completions.create({
      model: 'claude-2', // Or 'claude-instant-1'
      prompt: claudePrompt,
      max_tokens_to_sample: 1000,
      stream: true,
    });

    for await (const chunk of response) {
      yield chunk.completion;
    }
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

module.exports = { sendMessage };
