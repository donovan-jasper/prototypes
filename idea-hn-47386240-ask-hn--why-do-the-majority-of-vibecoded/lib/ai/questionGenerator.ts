import { Project } from '@/types/project';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'multiple-choice' | 'boolean';
  options?: string[];
}

export async function generateQuestions(project: Project): Promise<Question[]> {
  // In a real implementation, this would call the OpenAI API
  // For this prototype, we'll generate questions based on app type

  const questions: Question[] = [];

  // Common questions for all projects
  questions.push({
    id: 'q1',
    text: 'What is the primary value proposition of your app?',
    type: 'text',
  });

  questions.push({
    id: 'q2',
    text: 'How will users discover your app?',
    type: 'multiple-choice',
    options: [
      'Organic search',
      'Social media',
      'Referrals',
      'Paid advertising',
      'Other'
    ],
  });

  // App type specific questions
  switch (project.appType) {
    case 'social':
      questions.push({
        id: 'q3',
        text: 'What kind of content will users create and share?',
        type: 'text',
      });
      questions.push({
        id: 'q4',
        text: 'Should users be able to follow each other?',
        type: 'boolean',
      });
      break;

    case 'ecommerce':
      questions.push({
        id: 'q3',
        text: 'What is your pricing model?',
        type: 'multiple-choice',
        options: [
          'One-time purchase',
          'Subscription',
          'Freemium',
          'Other'
        ],
      });
      questions.push({
        id: 'q4',
        text: 'Will you offer shipping options?',
        type: 'boolean',
      });
      break;

    case 'fitness':
      questions.push({
        id: 'q3',
        text: 'What types of workouts will users track?',
        type: 'text',
      });
      questions.push({
        id: 'q4',
        text: 'Should users be able to share their progress with others?',
        type: 'boolean',
      });
      break;

    default:
      // Default questions for utility apps
      questions.push({
        id: 'q3',
        text: 'What is the main action users will perform?',
        type: 'text',
      });
      questions.push({
        id: 'q4',
        text: 'Will users need to create accounts?',
        type: 'boolean',
      });
  }

  // Add monetization questions
  questions.push({
    id: 'q5',
    text: 'How do you plan to monetize this app?',
    type: 'multiple-choice',
    options: [
      'Freemium model',
      'Subscription',
      'In-app purchases',
      'Ads',
      'Not sure yet'
    ],
  });

  // Add edge case questions
  questions.push({
    id: 'q6',
    text: 'What happens if users forget their password?',
    type: 'text',
  });

  return questions;
}
