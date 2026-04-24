import { Project } from '@/types/project';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'multiple-choice' | 'boolean';
  options?: string[];
}

export async function generateQuestions(project: Project): Promise<Question[]> {
  const questions: Question[] = [];

  // Common questions for all projects
  questions.push({
    id: 'target_audience',
    text: 'Who is your target audience?',
    type: 'text',
  });

  questions.push({
    id: 'main_feature',
    text: 'What is the main feature or value proposition of your app?',
    type: 'text',
  });

  // App type specific questions
  switch (project.appType) {
    case 'social':
      questions.push({
        id: 'content_type',
        text: 'What type of content will users share on your app?',
        type: 'multiple-choice',
        options: ['Text posts', 'Photos', 'Videos', 'Live streams', 'All of the above'],
      });

      questions.push({
        id: 'moderation',
        text: 'Do you need content moderation features?',
        type: 'boolean',
      });

      questions.push({
        id: 'notifications',
        text: 'How will users receive notifications about new activity?',
        type: 'multiple-choice',
        options: ['Push notifications', 'Email', 'In-app notifications', 'All of the above'],
      });
      break;

    case 'ecommerce':
      questions.push({
        id: 'payment_methods',
        text: 'Which payment methods will you support?',
        type: 'multiple-choice',
        options: ['Credit card', 'PayPal', 'Apple Pay', 'Google Pay', 'Cryptocurrency'],
      });

      questions.push({
        id: 'shipping_options',
        text: 'Will you offer shipping options?',
        type: 'boolean',
      });

      questions.push({
        id: 'inventory_management',
        text: 'Do you need inventory management features?',
        type: 'boolean',
      });
      break;

    case 'fitness':
      questions.push({
        id: 'workout_types',
        text: 'What types of workouts will users track?',
        type: 'multiple-choice',
        options: ['Cardio', 'Strength training', 'Flexibility', 'Mindfulness', 'All of the above'],
      });

      questions.push({
        id: 'progress_tracking',
        text: 'What metrics will you track for user progress?',
        type: 'text',
      });

      questions.push({
        id: 'social_features',
        text: 'Will users be able to share their progress with others?',
        type: 'boolean',
      });
      break;

    default:
      // Default questions for utility apps
      questions.push({
        id: 'primary_use_case',
        text: 'What is the primary use case for your app?',
        type: 'text',
      });

      questions.push({
        id: 'user_roles',
        text: 'Will there be different user roles or permissions?',
        type: 'boolean',
      });
  }

  // Monetization questions
  questions.push({
    id: 'monetization',
    text: 'How do you plan to monetize your app?',
    type: 'multiple-choice',
    options: [
      'Freemium model (free with premium features)',
      'Subscription (monthly/yearly fee)',
      'One-time purchase',
      'Ad-supported',
      'Not sure yet',
    ],
  });

  // Technical questions
  questions.push({
    id: 'authentication',
    text: 'What authentication methods will you support?',
    type: 'multiple-choice',
    options: ['Email/password', 'Social login (Google, Facebook, etc.)', 'Phone number', 'All of the above'],
  });

  questions.push({
    id: 'offline_support',
    text: 'Will your app need to work offline?',
    type: 'boolean',
  });

  return questions;
}
