const Anthropic = require('@anthropic-ai/sdk');
const dotenv = require('dotenv');

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function* sendMessage(prompt, conversationHistory) {
  try {
    const response = await anthropic.completions.create({
      model: 'claude-2',
      prompt: `${conversationHistory}\nHuman: ${prompt}\nAssistant:`,
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
