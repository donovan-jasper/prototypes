import { Project } from '@/types/project';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'multiple-choice' | 'boolean';
  options?: string[];
}

export async function generateQuestions(project: Project): Promise<Question[]> {
  // In a real implementation, this would call the OpenAI API
  // For this prototype, we'll use a rule-based approach

  const questions: Question[] = [];

  // Common questions for all projects
  questions.push({
    id: 'q1',
    text: 'What is the primary value proposition of your app?',
    type: 'text'
  });

  questions.push({
    id: 'q2',
    text: 'How will users discover your app?',
    type: 'multiple-choice',
    options: [
      'Organic search (SEO)',
      'Paid advertising',
      'Social media marketing',
      'Referrals from existing users',
      'Other'
    ]
  });

  // App type specific questions
  switch (project.appType) {
    case 'social':
      questions.push({
        id: 'q3',
        text: 'What types of content will users create and share?',
        type: 'text'
      });
      questions.push({
        id: 'q4',
        text: 'Should users be able to follow or connect with each other?',
        type: 'boolean'
      });
      break;

    case 'ecommerce':
      questions.push({
        id: 'q3',
        text: 'What is your pricing strategy?',
        type: 'multiple-choice',
        options: [
          'Fixed price per item',
          'Subscription model',
          'Tiered pricing',
          'Negotiated pricing',
          'Other'
        ]
      });
      questions.push({
        id: 'q4',
        text: 'Will you offer shipping or in-person pickup?',
        type: 'boolean'
      });
      break;

    case 'fitness':
      questions.push({
        id: 'q3',
        text: 'What types of workouts will you support?',
        type: 'text'
      });
      questions.push({
        id: 'q4',
        text: 'Should users be able to track their progress over time?',
        type: 'boolean'
      });
      break;

    default:
      questions.push({
        id: 'q3',
        text: 'What is the core functionality of your app?',
        type: 'text'
      });
      questions.push({
        id: 'q4',
        text: 'Do you need user accounts for this app?',
        type: 'boolean'
      });
  }

  // Monetization questions
  if (project.appType !== 'ecommerce') {
    questions.push({
      id: 'q5',
      text: 'How do you plan to monetize this app?',
      type: 'multiple-choice',
      options: [
        'Freemium model (free with premium features)',
        'Subscription service',
        'Ad-supported',
        'One-time purchase',
        'Not sure yet'
      ]
    });
  }

  // Technical questions
  questions.push({
    id: 'q6',
    text: 'What platforms should this app support?',
    type: 'multiple-choice',
    options: [
      'iOS only',
      'Android only',
      'Both iOS and Android',
      'Web browser',
      'All of the above'
    ]
  });

  // Edge case questions
  questions.push({
    id: 'q7',
    text: 'What should happen if the user loses internet connection?',
    type: 'text'
  });

  questions.push({
    id: 'q8',
    text: 'How will you handle user authentication and security?',
    type: 'text'
  });

  return questions;
}
