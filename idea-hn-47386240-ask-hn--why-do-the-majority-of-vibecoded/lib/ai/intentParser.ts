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
  // For this prototype, we'll use a more sophisticated rule-based approach

  const lowerDesc = description.toLowerCase();

  // Determine app type with more sophisticated matching
  let appType = 'utility';
  const appTypeKeywords = {
    'social': ['social', 'network', 'community', 'connect', 'share', 'follow', 'feed', 'post', 'comment'],
    'ecommerce': ['ecommerce', 'shop', 'buy', 'sell', 'marketplace', 'checkout', 'cart', 'payment', 'product'],
    'fitness': ['fitness', 'workout', 'health', 'exercise', 'gym', 'track', 'progress', 'nutrition'],
    'food': ['food', 'restaurant', 'delivery', 'order', 'meal', 'recipe', 'cook', 'eat'],
    'travel': ['travel', 'booking', 'hotel', 'flight', 'vacation', 'trip', 'destination', 'explore'],
    'education': ['learn', 'study', 'teach', 'course', 'class', 'tutor', 'school', 'university'],
    'productivity': ['productivity', 'task', 'todo', 'schedule', 'calendar', 'reminder', 'organize', 'manage']
  };

  for (const [type, keywords] of Object.entries(appTypeKeywords)) {
    if (keywords.some(keyword => lowerDesc.includes(keyword))) {
      appType = type;
      break;
    }
  }

  // Extract target audience with more sophisticated matching
  const audienceKeywords = [
    'students', 'parents', 'businesses', 'professionals', 'athletes', 'dog owners',
    'plant lovers', 'pet owners', 'gamers', 'parents', 'teachers', 'travelers',
    'cooks', 'fitness enthusiasts', 'small businesses', 'freelancers', 'entrepreneurs'
  ];
  const targetAudience = audienceKeywords.filter(keyword => lowerDesc.includes(keyword));

  // Extract key features with more sophisticated matching
  const featureKeywords = [
    'login', 'signup', 'profile', 'feed', 'posts', 'comments', 'messages',
    'payments', 'checkout', 'search', 'filters', 'notifications', 'settings',
    'dashboard', 'analytics', 'calendar', 'scheduling', 'booking', 'reviews',
    'ratings', 'favorites', 'wishlist', 'cart', 'inventory', 'orders', 'shipping',
    'payment', 'subscription', 'membership', 'chat', 'video call', 'audio call',
    'video', 'audio', 'upload', 'download', 'share', 'collaborate', 'document',
    'file', 'folder', 'project', 'team', 'collaboration', 'task', 'todo', 'reminder'
  ];
  const keyFeatures = featureKeywords.filter(keyword => lowerDesc.includes(keyword));

  // Generate monetization ideas based on app type
  const monetizationIdeas = [];
  switch (appType) {
    case 'ecommerce':
      monetizationIdeas.push('Subscription model', 'One-time purchases', 'Affiliate marketing', 'Membership tiers');
      break;
    case 'social':
      monetizationIdeas.push('Premium membership', 'Ad-supported free version', 'Virtual goods', 'Sponsored posts');
      break;
    case 'fitness':
      monetizationIdeas.push('Premium coaching', 'Subscription to content', 'Merchandise', 'Sponsorships');
      break;
    case 'food':
      monetizationIdeas.push('Delivery fees', 'Subscription boxes', 'Premium recipes', 'Advertising');
      break;
    case 'travel':
      monetizationIdeas.push('Booking fees', 'Premium travel packages', 'Advertising', 'Affiliate marketing');
      break;
    case 'education':
      monetizationIdeas.push('Course fees', 'Certification', 'Premium content', 'Subscription');
      break;
    case 'productivity':
      monetizationIdeas.push('Freemium model', 'Power-ups', 'Team plans', 'Enterprise solutions');
      break;
    default:
      monetizationIdeas.push('Freemium model', 'In-app purchases', 'Sponsored content', 'Subscription');
  }

  // Check if description needs clarification
  const needsClarification = description.split(' ').length < 10 || !keyFeatures.length;

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
