import type { Project } from '@/types/project';

export interface IntentResult {
  appType: string;
  targetAudience: string[];
  features: string[];
  monetizationIdeas: string[];
  needsClarification: boolean;
  questions: string[];
}

/**
 * Mocks the AI intent parsing.
 * In a real scenario, this would call an OpenAI API (e.g., GPT-4)
 * with a sophisticated prompt to extract structured data from the description.
 */
export async function parseIntent(description: string): Promise<IntentResult> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const lowerDescription = description.toLowerCase();

  let appType = 'general';
  const features: string[] = [];
  const targetAudience: string[] = [];
  const monetizationIdeas: string[] = [];
  let needsClarification = false;
  const questions: string[] = [];

  // Simple keyword-based parsing for mock data
  if (lowerDescription.includes('social') || lowerDescription.includes('community')) {
    appType = 'social';
    features.push('user_profiles', 'feed', 'messaging');
    monetizationIdeas.push('ads', 'premium_features');
  } else if (lowerDescription.includes('fitness') || lowerDescription.includes('workout')) {
    appType = 'fitness';
    features.push('workout_logging', 'progress_tracking', 'goal_setting');
    monetizationIdeas.push('subscription', 'premium_plans');
  } else if (lowerDescription.includes('e-commerce') || lowerDescription.includes('shop') || lowerDescription.includes('store')) {
    appType = 'ecommerce';
    features.push('product_catalog', 'cart', 'checkout', 'order_history');
    monetizationIdeas.push('transaction_fees');
  } else if (lowerDescription.includes('task') || lowerDescription.includes('todo') || lowerDescription.includes('productivity')) {
    appType = 'productivity';
    features.push('task_management', 'reminders', 'project_tracking');
    monetizationIdeas.push('subscription', 'one_time_purchase');
  } else if (lowerDescription.includes('blog') || lowerDescription.includes('news')) {
    appType = 'content';
    features.push('articles', 'categories', 'search');
    monetizationIdeas.push('ads', 'premium_content');
  } else if (lowerDescription.includes('recipe') || lowerDescription.includes('food')) {
    appType = 'food';
    features.push('recipe_search', 'meal_planning', 'shopping_list');
    monetizationIdeas.push('ads', 'premium_recipes');
  }

  if (lowerDescription.includes('users can post')) {
    features.push('post_creation');
  }
  if (lowerDescription.includes('track progress')) {
    features.push('progress_tracking');
  }
  if (lowerDescription.includes('buy products')) {
    features.push('checkout');
  }
  if (lowerDescription.includes('login') || lowerDescription.includes('sign up')) {
    features.push('authentication');
  }

  if (lowerDescription.includes('dog owners')) {
    targetAudience.push('dog owners');
  }
  if (lowerDescription.includes('students')) {
    targetAudience.push('students');
  }

  // Simulate clarification for vague descriptions
  if (description.split(' ').length < 5 || appType === 'general') {
    needsClarification = true;
    questions.push('What is the main purpose of your app?', 'Who are the primary users?', 'What is one key feature you envision?');
  }

  return {
    appType,
    targetAudience: targetAudience.length > 0 ? targetAudience : ['general users'],
    features: features.length > 0 ? features : ['basic_info_display'],
    monetizationIdeas: monetizationIdeas.length > 0 ? monetizationIdeas : ['none'],
    needsClarification,
    questions,
  };
}
