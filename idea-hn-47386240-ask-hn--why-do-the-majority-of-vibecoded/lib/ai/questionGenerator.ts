import type { Project } from '@/types/project';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'multiple-choice' | 'boolean';
  options?: string[];
}

export async function generateQuestions(project: Project): Promise<Question[]> {
  // In a real implementation, this would call the OpenAI API
  // For this prototype, we'll return a set of questions based on the project type

  const baseQuestions: Question[] = [
    {
      id: 'target_audience',
      text: 'Who is your target audience?',
      type: 'text',
    },
    {
      id: 'main_feature',
      text: 'What is the main feature or value proposition of your app?',
      type: 'text',
    },
    {
      id: 'user_flow',
      text: 'What is the primary user flow in your app?',
      type: 'text',
    },
    {
      id: 'auth_required',
      text: 'Will users need to create accounts to use your app?',
      type: 'boolean',
    },
  ];

  // Add app-type specific questions
  const appTypeQuestions: Record<string, Question[]> = {
    social: [
      {
        id: 'content_type',
        text: 'What type of content will users create and share?',
        type: 'multiple-choice',
        options: ['Photos', 'Videos', 'Text posts', 'Audio clips', 'Other'],
      },
      {
        id: 'interaction_type',
        text: 'What types of interactions will users have with each other?',
        type: 'multiple-choice',
        options: ['Likes', 'Comments', 'Sharing', 'Messaging', 'Other'],
      },
    ],
    ecommerce: [
      {
        id: 'product_type',
        text: 'What type of products will you sell?',
        type: 'text',
      },
      {
        id: 'payment_methods',
        text: 'What payment methods will you support?',
        type: 'multiple-choice',
        options: ['Credit card', 'PayPal', 'Apple Pay', 'Google Pay', 'Cryptocurrency', 'Other'],
      },
    ],
    fitness: [
      {
        id: 'workout_types',
        text: 'What types of workouts will users track?',
        type: 'multiple-choice',
        options: ['Cardio', 'Strength training', 'Yoga', 'Flexibility', 'Other'],
      },
      {
        id: 'progress_tracking',
        text: 'What metrics will you track for user progress?',
        type: 'text',
      },
    ],
  };

  // Combine all questions
  const questions = [...baseQuestions];

  if (project.appType && appTypeQuestions[project.appType]) {
    questions.push(...appTypeQuestions[project.appType]);
  }

  // Add a final question about monetization
  questions.push({
    id: 'monetization',
    text: 'How do you plan to monetize your app?',
    type: 'multiple-choice',
    options: [
      'Subscription',
      'One-time purchase',
      'Ads',
      'Freemium model',
      'Not sure yet',
      'Other'
    ],
  });

  // Generate unique IDs for each question
  return questions.map((q, index) => ({
    ...q,
    id: q.id || `q_${index}`,
  }));
}
