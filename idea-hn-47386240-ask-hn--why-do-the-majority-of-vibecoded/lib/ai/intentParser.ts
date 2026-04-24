import { Project } from '@/types/project';

interface IntentResult {
  appType: string;
  targetAudience: string;
  keyFeatures: string[];
  monetizationIdeas: string[];
  needsClarification: boolean;
  questions: string[];
}

export async function parseIntent(description: string): Promise<IntentResult> {
  // In a real implementation, this would call the OpenAI API
  // For this prototype, we'll use a simple rule-based approach

  const lowerDesc = description.toLowerCase();

  // Determine app type
  let appType = 'utility';
  if (lowerDesc.includes('social') || lowerDesc.includes('network') || lowerDesc.includes('community')) {
    appType = 'social';
  } else if (lowerDesc.includes('ecommerce') || lowerDesc.includes('shop') || lowerDesc.includes('buy')) {
    appType = 'ecommerce';
  } else if (lowerDesc.includes('fitness') || lowerDesc.includes('workout') || lowerDesc.includes('health')) {
    appType = 'fitness';
  } else if (lowerDesc.includes('food') || lowerDesc.includes('recipe') || lowerDesc.includes('meal')) {
    appType = 'food';
  } else if (lowerDesc.includes('education') || lowerDesc.includes('learn') || lowerDesc.includes('study')) {
    appType = 'education';
  }

  // Extract key features
  const keyFeatures: string[] = [];
  if (lowerDesc.includes('login') || lowerDesc.includes('sign up') || lowerDesc.includes('account')) {
    keyFeatures.push('authentication');
  }
  if (lowerDesc.includes('pay') || lowerDesc.includes('payment') || lowerDesc.includes('checkout')) {
    keyFeatures.push('payments');
  }
  if (lowerDesc.includes('post') || lowerDesc.includes('share') || lowerDesc.includes('upload')) {
    keyFeatures.push('content_creation');
  }
  if (lowerDesc.includes('track') || lowerDesc.includes('progress') || lowerDesc.includes('log')) {
    keyFeatures.push('data_tracking');
  }

  // Determine if clarification is needed
  const needsClarification = description.split(' ').length < 10;
  const questions = needsClarification
    ? [
        "Could you describe your target audience in more detail?",
        "What are the main features you want to include?",
        "How do you plan to monetize this app?"
      ]
    : [];

  return {
    appType,
    targetAudience: extractTargetAudience(description),
    keyFeatures,
    monetizationIdeas: extractMonetizationIdeas(description),
    needsClarification,
    questions,
  };
}

function extractTargetAudience(description: string): string {
  const audienceKeywords = [
    'for', 'to', 'who', 'users', 'customers', 'people', 'students', 'businesses',
    'entrepreneurs', 'parents', 'athletes', 'cooks', 'teachers'
  ];

  const words = description.split(' ');
  for (let i = 0; i < words.length; i++) {
    if (audienceKeywords.includes(words[i].toLowerCase())) {
      // Return the next few words as the audience description
      const audience = words.slice(i + 1, i + 6).join(' ');
      return audience.replace(/[^a-zA-Z0-9 ]/g, '');
    }
  }

  return 'general users';
}

function extractMonetizationIdeas(description: string): string[] {
  const monetizationKeywords = [
    'pay', 'payment', 'subscribe', 'membership', 'ad', 'ads', 'advertisement',
    'sell', 'buy', 'purchase', 'donate', 'tip', 'premium', 'pro', 'upgrade'
  ];

  const ideas: string[] = [];
  const lowerDesc = description.toLowerCase();

  if (lowerDesc.includes('free') && lowerDesc.includes('premium')) {
    ideas.push('freemium_model');
  }
  if (lowerDesc.includes('ad') || lowerDesc.includes('ads')) {
    ideas.push('ad_supported');
  }
  if (lowerDesc.includes('subscription') || lowerDesc.includes('membership')) {
    ideas.push('subscription_based');
  }
  if (lowerDesc.includes('sell') || lowerDesc.includes('buy') || lowerDesc.includes('purchase')) {
    ideas.push('ecommerce');
  }

  return ideas.length > 0 ? ideas : ['not_specified'];
}
