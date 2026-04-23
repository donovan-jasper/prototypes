import { Configuration, OpenAIApi } from 'openai';
import { Issue } from '../types';
import { fetchRepoReadme, fetchRepoContributing } from './github';

const configuration = new Configuration({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

interface QuestionLog {
  userId: string;
  timestamp: Date;
  questionCount: number;
}

let questionLogs: QuestionLog[] = [];

export const askMentor = async (question: string, issue: Issue): Promise<string> => {
  try {
    // Fetch additional context from GitHub
    const [readme, contributing] = await Promise.all([
      fetchRepoReadme(issue.repository.owner, issue.repository.name),
      fetchRepoContributing(issue.repository.owner, issue.repository.name)
    ]);

    const context = `
      Issue: ${issue.title}
      Repository: ${issue.repository.name}
      Labels: ${issue.labels.join(', ')}
      README: ${readme || 'No README available'}
      CONTRIBUTING: ${contributing || 'No CONTRIBUTING guide available'}
    `;

    const response = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful coding mentor. The user is working on the following issue:
          ${context}

          Answer their question concisely and directly. If you need more information, ask follow-up questions.`
        },
        {
          role: 'user',
          content: question
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.data.choices[0].message?.content || "I'm sorry, I couldn't generate a response. Please try rephrasing your question.";
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('Failed to get AI response');
  }
};

export const logQuestion = (userId: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find existing log for today
  const existingLog = questionLogs.find(log =>
    log.userId === userId &&
    new Date(log.timestamp).setHours(0, 0, 0, 0) === today.getTime()
  );

  if (existingLog) {
    if (existingLog.questionCount >= 5) {
      return false; // Limit reached
    }
    existingLog.questionCount += 1;
  } else {
    questionLogs.push({
      userId,
      timestamp: today,
      questionCount: 1
    });
  }

  return true;
};

export const getRemainingQuestions = (userId: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingLog = questionLogs.find(log =>
    log.userId === userId &&
    new Date(log.timestamp).setHours(0, 0, 0, 0) === today.getTime()
  );

  return existingLog ? Math.max(0, 5 - existingLog.questionCount) : 5;
};
