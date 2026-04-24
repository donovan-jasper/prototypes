import { Project } from '@/types/project';

interface IntentResult {
  appType: string;
  targetAudience: string[];
  keyFeatures: string[];
  monetizationIdeas: string[];
  needsClarification: boolean;
  questions?: string[];
}

export async function parseIntent(description: string): Promise<IntentResult> {
  // In a real implementation, this would call the OpenAI API
  // For this prototype, we'll use a simple rule-based approach

  const lowerDesc = description.toLowerCase();

  // Determine app type
  let appType = 'utility';
  if (lowerDesc.includes('social') || lowerDesc.includes('network') || lowerDesc.includes('community')) {
    appType = 'social';
  } else if (lowerDesc.includes('ecommerce') || lowerDesc.includes('shop') || lowerDesc.includes('buy') || lowerDesc.includes('sell')) {
    appType = 'ecommerce';
  } else if (lowerDesc.includes('fitness') || lowerDesc.includes('workout') || lowerDesc.includes('health')) {
    appType = 'fitness';
  } else if (lowerDesc.includes('food') || lowerDesc.includes('restaurant') || lowerDesc.includes('delivery')) {
    appType = 'food';
  } else if (lowerDesc.includes('travel') || lowerDesc.includes('booking') || lowerDesc.includes('hotel')) {
    appType = 'travel';
  }

  // Extract target audience
  const audienceKeywords = ['students', 'parents', 'businesses', 'professionals', 'athletes', 'dog owners', 'plant lovers'];
  const targetAudience = audienceKeywords.filter(keyword => lowerDesc.includes(keyword));

  // Extract key features
  const featureKeywords = ['login', 'signup', 'profile', 'feed', 'posts', 'comments', 'messages', 'payments', 'checkout', 'search', 'filters'];
  const keyFeatures = featureKeywords.filter(keyword => lowerDesc.includes(keyword));

  // Generate monetization ideas
  const monetizationIdeas = [];
  if (appType === 'ecommerce') {
    monetizationIdeas.push('Subscription model', 'One-time purchases', 'Affiliate marketing');
  } else if (appType === 'social') {
    monetizationIdeas.push('Premium membership', 'Ad-supported free version', 'Virtual goods');
  } else {
    monetizationIdeas.push('Freemium model', 'In-app purchases', 'Sponsored content');
  }

  // Check if description needs clarification
  const needsClarification = description.split(' ').length < 10;

  // Generate clarifying questions if needed
  const questions = needsClarification
    ? [
        "Could you describe your target audience in more detail?",
        "What are the main features you want to include?",
        "How do you plan to monetize this app?"
      ]
    : [];

  return {
    appType,
    targetAudience: targetAudience.length > 0 ? targetAudience : ['general audience'],
    keyFeatures: keyFeatures.length > 0 ? keyFeatures : ['basic functionality'],
    monetizationIdeas,
    needsClarification,
    questions,
  };
}
