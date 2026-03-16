import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateEncouragementMessage = async (taskTitle: string, streakCount: number) => {
  try {
    const prompt = `
    Generate a short, encouraging message for someone who just completed the task "${taskTitle}".
    They currently have a ${streakCount}-day streak. Make it friendly, motivational, and personalized.
    Keep it under 100 words.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
    });

    return completion.choices[0].message.content?.trim() || '';
  } catch (error) {
    console.error('Error generating encouragement message:', error);
    return "You're doing great! Keep up the good work!";
  }
};

export const generateTaskSuggestions = async (interests: string[]) => {
  try {
    const interestsStr = interests.join(', ');
    const prompt = `
    Suggest 5 small daily tasks that would be suitable for someone interested in ${interestsStr}.
    Each task should take less than 15 minutes to complete.
    Format as a numbered list with one task per line.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
    });

    const suggestions = completion.choices[0].message.content?.trim() || '';
    return suggestions.split('\n').filter(line => line.trim() !== '');
  } catch (error) {
    console.error('Error generating task suggestions:', error);
    return [];
  }
};
