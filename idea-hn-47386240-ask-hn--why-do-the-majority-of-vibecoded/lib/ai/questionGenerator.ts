import { Project } from '@/types/project';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'multiple-choice' | 'boolean';
  options?: string[];
}

export async function generateQuestions(project: Project): Promise<Question[]> {
  // In a real implementation, this would call the OpenAI API
  // For this prototype, we'll generate questions based on the project type

  const questions: Question[] = [];

  // Common questions for all projects
  questions.push({
    id: 'q1',
    text: 'What is the primary value proposition of your app?',
    type: 'text',
  });

  questions.push({
    id: 'q2',
    text: 'Who is your target audience?',
    type: 'text',
  });

  questions.push({
    id: 'q3',
    text: 'How will users discover your app?',
    type: 'multiple-choice',
    options: [
      'Organic search',
      'Paid advertising',
      'Referrals',
      'Social media',
      'Other'
    ],
  });

  // App type specific questions
  switch (project.appType) {
    case 'social':
      questions.push({
        id: 'q4',
        text: 'What types of content will users create and share?',
        type: 'text',
      });

      questions.push({
        id: 'q5',
        text: 'How will you handle inappropriate content?',
        type: 'multiple-choice',
        options: [
          'Manual moderation',
          'AI-powered moderation',
          'User reporting system',
          'Community guidelines'
        ],
      });

      questions.push({
        id: 'q6',
        text: 'Will users be able to follow each other?',
        type: 'boolean',
      });
      break;

    case 'ecommerce':
      questions.push({
        id: 'q4',
        text: 'What is your pricing strategy?',
        type: 'multiple-choice',
        options: [
          'Fixed prices',
          'Dynamic pricing',
          'Subscription model',
          'Pay-what-you-want'
        ],
      });

      questions.push({
        id: 'q5',
        text: 'How will you handle payments?',
        type: 'multiple-choice',
        options: [
          'Credit card only',
          'Multiple payment methods',
          'Cryptocurrency',
          'In-app purchases'
        ],
      });

      questions.push({
        id: 'q6',
        text: 'Will you offer shipping?',
        type: 'boolean',
      });
      break;

    case 'fitness':
      questions.push({
        id: 'q4',
        text: 'What types of workouts will you support?',
        type: 'text',
      });

      questions.push({
        id: 'q5',
        text: 'Will you track progress metrics?',
        type: 'boolean',
      });

      questions.push({
        id: 'q6',
        text: 'How will you handle user data privacy?',
        type: 'multiple-choice',
        options: [
          'No data collection',
          'Anonymous data',
          'Personalized data',
          'Third-party sharing'
        ],
      });
      break;

    default: // utility or other app types
      questions.push({
        id: 'q4',
        text: 'What is the main functionality of your app?',
        type: 'text',
      });

      questions.push({
        id: 'q5',
        text: 'How will users interact with your app?',
        type: 'multiple-choice',
        options: [
          'Single screen',
          'Multi-step process',
          'Real-time updates',
          'Scheduled tasks'
        ],
      });

      questions.push({
        id: 'q6',
        text: 'Will you need user accounts?',
        type: 'boolean',
      });
  }

  // Monetization questions
  questions.push({
    id: 'q7',
    text: 'How will you monetize your app?',
    type: 'multiple-choice',
    options: [
      'Freemium model',
      'Subscription',
      'One-time purchase',
      'Advertising',
      'Not sure yet'
    ],
  });

  // Technical questions
  questions.push({
    id: 'q8',
    text: 'Do you need any specific technical integrations?',
    type: 'text',
  });

  return questions;
}
