import type { Project } from '@/types/project';

interface IntentResult {
  appType: string;
  targetAudience: string;
  keyFeatures: string[];
  monetizationIdeas: string[];
  needsClarification: boolean;
  questions?: string[];
}

export async function parseIntent(description: string): Promise<IntentResult> {
  // In a real implementation, this would call the OpenAI API
  // For this prototype, we'll use simple pattern matching

  const lowerDesc = description.toLowerCase();

  // Determine app type
  let appType = 'utility'; // default
  const appTypeKeywords: Record<string, string[]> = {
    social: ['social', 'network', 'community', 'friends', 'followers', 'sharing', 'posts', 'feed'],
    ecommerce: ['shop', 'store', 'buy', 'sell', 'marketplace', 'checkout', 'cart', 'payment'],
    fitness: ['fitness', 'workout', 'exercise', 'gym', 'health', 'track', 'progress'],
    education: ['learn', 'study', 'teach', 'course', 'lesson', 'quiz', 'tutorial'],
    productivity: ['task', 'todo', 'organize', 'schedule', 'calendar', 'reminder', 'planner'],
    travel: ['travel', 'trip', 'hotel', 'flight', 'booking', 'map', 'navigation'],
  };

  for (const [type, keywords] of Object.entries(appTypeKeywords)) {
    if (keywords.some(keyword => lowerDesc.includes(keyword))) {
      appType = type;
      break;
    }
  }

  // Extract target audience
  let targetAudience = 'general users';
  const audienceKeywords = ['for', 'who', 'users', 'people', 'customers', 'students', 'professionals'];
  const audiencePattern = new RegExp(`(${audienceKeywords.join('|')})\\s+(.+?)(?=\\s*(?:and|or|with|,|$))`, 'i');
  const audienceMatch = lowerDesc.match(audiencePattern);
  if (audienceMatch && audienceMatch[2]) {
    targetAudience = audienceMatch[2].trim();
  }

  // Extract key features
  const featureKeywords = ['can', 'will', 'allow', 'enable', 'feature', 'function', 'include'];
  const featurePattern = new RegExp(`(${featureKeywords.join('|')})\\s+(.+?)(?=\\s*(?:and|or|with|,|$))`, 'i');
  const featureMatches = [...lowerDesc.matchAll(featurePattern)];
  const keyFeatures = featureMatches.map(match => match[2].trim()).filter(f => f.length > 3);

  // Generate monetization ideas
  const monetizationIdeas = [];
  if (lowerDesc.includes('pay') || lowerDesc.includes('purchase') || lowerDesc.includes('subscription')) {
    monetizationIdeas.push('Paid features or subscriptions');
  }
  if (lowerDesc.includes('sell') || lowerDesc.includes('buy') || lowerDesc.includes('marketplace')) {
    monetizationIdeas.push('E-commerce transactions');
  }
  if (lowerDesc.includes('ad') || lowerDesc.includes('ads') || lowerDesc.includes('advertisement')) {
    monetizationIdeas.push('Advertising');
  }
  if (monetizationIdeas.length === 0) {
    monetizationIdeas.push('Freemium model', 'In-app purchases');
  }

  // Check if description needs clarification
  const needsClarification = description.length < 50 || keyFeatures.length < 2;

  // Generate clarifying questions if needed
  const questions: string[] = [];
  if (needsClarification) {
    if (description.length < 50) {
      questions.push('Could you please provide more details about your app idea?');
    }
    if (keyFeatures.length < 2) {
      questions.push('What are the main features you want to include in your app?');
    }
    if (!lowerDesc.includes('who')) {
      questions.push('Who is your target audience for this app?');
    }
  }

  return {
    appType,
    targetAudience,
    keyFeatures,
    monetizationIdeas,
    needsClarification,
    questions: needsClarification ? questions : undefined,
  };
}
