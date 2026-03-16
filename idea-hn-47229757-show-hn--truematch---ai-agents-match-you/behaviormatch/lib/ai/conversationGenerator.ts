import { generateCompatibilityInsights } from './matchingEngine';

export const generateConversationStarters = (userVector, matchVector) => {
  const insights = generateCompatibilityInsights(userVector, matchVector);

  // Generate conversation starters based on compatibility insights
  const starters = [];

  insights.forEach(insight => {
    if (insight.title === 'Communication Style') {
      starters.push('Have you noticed how we both enjoy deep conversations? What\'s something you\'ve been thinking about lately?');
    } else if (insight.title === 'Energy Levels') {
      starters.push('It seems like we both stay engaged for a while. What keeps you interested in conversations?');
    } else if (insight.title === 'Interaction Preferences') {
      starters.push('We both seem to enjoy exploring new topics. What\'s something you\'d like to learn more about?');
    }
  });

  // Add some generic conversation starters
  starters.push('What\'s been on your mind lately?');
  starters.push('Do you have any interesting hobbies or passions?');
  starters.push('What\'s something you\'re looking forward to this week?');

  return starters;
};
