import { Project } from '@/types/project';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'multiple-choice' | 'boolean';
  options?: string[];
}

export async function generateQuestions(project: Project): Promise<Question[]> {
  // In a real implementation, this would call the OpenAI API
  // For this prototype, we'll generate more comprehensive questions based on app type

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
      'Email marketing',
      'Other'
    ],
  });

  questions.push({
    id: 'q3',
    text: 'What is your target audience?',
    type: 'text',
  });

  // App type specific questions
  switch (project.appType) {
    case 'social':
      questions.push({
        id: 'q4',
        text: 'What kind of content will users create and share?',
        type: 'text',
      });
      questions.push({
        id: 'q5',
        text: 'Should users be able to follow each other?',
        type: 'boolean',
      });
      questions.push({
        id: 'q6',
        text: 'What kind of interactions should be supported?',
        type: 'multiple-choice',
        options: [
          'Likes and comments',
          'Direct messaging',
          'Sharing posts',
          'Group chats',
          'All of the above'
        ],
      });
      break;

    case 'ecommerce':
      questions.push({
        id: 'q4',
        text: 'What is your pricing model?',
        type: 'multiple-choice',
        options: [
          'One-time purchase',
          'Subscription',
          'Freemium',
          'Pay-per-use',
          'Other'
        ],
      });
      questions.push({
        id: 'q5',
        text: 'Will you offer shipping options?',
        type: 'boolean',
      });
      questions.push({
        id: 'q6',
        text: 'What payment methods will you support?',
        type: 'text',
      });
      break;

    case 'fitness':
      questions.push({
        id: 'q4',
        text: 'What types of workouts will users track?',
        type: 'text',
      });
      questions.push({
        id: 'q5',
        text: 'Should users be able to share their progress with others?',
        type: 'boolean',
      });
      questions.push({
        id: 'q6',
        text: 'Will you include nutrition tracking?',
        type: 'boolean',
      });
      break;

    case 'food':
      questions.push({
        id: 'q4',
        text: 'What type of food delivery will you offer?',
        type: 'multiple-choice',
        options: [
          'Restaurant delivery',
          'Grocery delivery',
          'Meal kits',
          'Food subscription boxes',
          'Other'
        ],
      });
      questions.push({
        id: 'q5',
        text: 'Will users be able to order from multiple restaurants?',
        type: 'boolean',
      });
      break;

    case 'travel':
      questions.push({
        id: 'q4',
        text: 'What types of bookings will you support?',
        type: 'text',
      });
      questions.push({
        id: 'q5',
        text: 'Will you include travel insurance options?',
        type: 'boolean',
      });
      break;

    case 'education':
      questions.push({
        id: 'q4',
        text: 'What subjects or topics will you cover?',
        type: 'text',
      });
      questions.push({
        id: 'q5',
        text: 'Will you offer certification or badges?',
        type: 'boolean',
      });
      break;

    case 'productivity':
      questions.push({
        id: 'q4',
        text: 'What are the main productivity features you want to include?',
        type: 'text',
      });
      questions.push({
        id: 'q5',
        text: 'Will you support team collaboration?',
        type: 'boolean',
      });
      break;

    default:
      // Default questions for utility apps
      questions.push({
        id: 'q4',
        text: 'What is the main action users will perform?',
        type: 'text',
      });
      questions.push({
        id: 'q5',
        text: 'Will users need to create accounts?',
        type: 'boolean',
      });
      questions.push({
        id: 'q6',
        text: 'What data will users need to input?',
        type: 'text',
      });
  }

  // Add monetization questions
  questions.push({
    id: 'q7',
    text: 'How do you plan to monetize this app?',
    type: 'multiple-choice',
    options: [
      'Freemium model',
      'Subscription',
      'In-app purchases',
      'Ads',
      'Sponsored content',
      'Affiliate marketing',
      'Not sure yet'
    ],
  });

  // Add edge case questions
  questions.push({
    id: 'q8',
    text: 'What happens if users forget their password?',
    type: 'text',
  });

  questions.push({
    id: 'q9',
    text: 'How will you handle user data privacy and security?',
    type: 'text',
  });

  questions.push({
    id: 'q10',
    text: 'What is your plan for onboarding new users?',
    type: 'text',
  });

  return questions;
}
