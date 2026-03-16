const { OpenAI } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function* sendMessage(prompt, conversationHistory) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        ...conversationHistory,
        { role: 'user', content: prompt },
      ],
      stream: true,
    });

    for await (const chunk of response) {
      yield chunk.choices[0].delta.content;
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

module.exports = { sendMessage };
