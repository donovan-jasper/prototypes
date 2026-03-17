import { generateCompatibilityInsights } from './matchingEngine';

export const generateConversationStarters = (userVector, matchVector) => {
  const insights = generateCompatibilityInsights(userVector, matchVector);

  // Generate conversation starters based on compatibility insights
  const starters = [];

  insights.forEach(insight => {
    if (insight.title === 'Communication Style') {
      if (insight.description.includes('deep conversations')) {
        starters.push('Have you noticed how we both enjoy deep conversations? What\'s something you\'ve been thinking about lately?');
      } else if (insight.description.includes('quick exchanges')) {
        starters.push('We seem to enjoy quick exchanges. What\'s something interesting you\'ve learned recently?');
      }
    } else if (insight.title === 'Energy Levels') {
      if (insight.description.includes('consistent engagement')) {
        starters.push('It seems like we both stay engaged for a while. What keeps you interested in conversations?');
      } else if (insight.description.includes('short bursts')) {
        starters.push('We both seem to have short bursts of energy. What\'s something you\'re excited about right now?');
      }
    } else if (insight.title === 'Interaction Preferences') {
      if (insight.description.includes('exploring new topics')) {
        starters.push('We both seem to enjoy exploring new topics. What\'s something you\'d like to learn more about?');
      } else if (insight.description.includes('following familiar paths')) {
        starters.push('It looks like we both prefer familiar topics. What\'s something you enjoy talking about?');
      }
    } else if (insight.title === 'Response Patterns') {
      if (insight.description.includes('quick responses')) {
        starters.push('You both seem to respond quickly. What\'s something you\'re thinking about right now?');
      } else if (insight.description.includes('thoughtful replies')) {
        starters.push('We both take time to craft thoughtful replies. What\'s something you\'ve been reflecting on?');
      }
    } else if (insight.title === 'Conversation Depth') {
      if (insight.description.includes('long conversations')) {
        starters.push('You both enjoy long conversations. What\'s something you\'ve been meaning to talk about?');
      } else if (insight.description.includes('short exchanges')) {
        starters.push('We both prefer shorter exchanges. What\'s something you\'re curious about?');
      }
    }
  });

  // Add some generic conversation starters if we don't have enough
  if (starters.length < 3) {
    starters.push('What\'s been on your mind lately?');
    starters.push('Do you have any interesting hobbies or passions?');
    starters.push('What\'s something you\'re looking forward to this week?');
  }

  // Ensure we have exactly 3-5 starters
  if (starters.length > 5) {
    starters = starters.slice(0, 5);
  } else if (starters.length < 3) {
    starters.push('What\'s something you\'ve been meaning to try?');
    starters.push('Do you have any favorite books, movies, or shows?');
  }

  return starters;
};
