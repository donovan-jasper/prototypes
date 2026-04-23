import { generateCompatibilityInsights } from './matchingEngine';

export const generateConversationStarters = (userVector: any, matchVector: any) => {
  const insights = generateCompatibilityInsights(userVector, matchVector);

  // Generate conversation starters based on compatibility insights
  const starters: string[] = [];

  // Process each insight to generate relevant conversation starters
  insights.forEach(insight => {
    switch (insight.title) {
      case 'Communication Style':
        if (insight.description.includes('deep conversations')) {
          starters.push('We both enjoy deep conversations. What\'s something you\'ve been thinking about lately?');
          starters.push('Do you have any philosophical questions you\'d like to discuss?');
        } else if (insight.description.includes('quick exchanges')) {
          starters.push('We both prefer quick exchanges. What\'s something interesting you\'ve learned recently?');
          starters.push('Do you have any fun facts to share?');
        }
        break;

      case 'Energy Levels':
        if (insight.description.includes('consistent engagement')) {
          starters.push('We both stay engaged for a while. What keeps you interested in conversations?');
          starters.push('Do you have any long-term projects or goals you\'re working on?');
        } else if (insight.description.includes('short bursts')) {
          starters.push('We both have short bursts of energy. What\'s something exciting you\'re working on?');
          starters.push('Do you have any quick questions or thoughts you\'d like to share?');
        }
        break;

      case 'Interaction Preferences':
        if (insight.description.includes('exploring new topics')) {
          starters.push('We both enjoy exploring new topics. What\'s something you\'d like to learn more about?');
          starters.push('Do you have any unusual hobbies or interests?');
        } else if (insight.description.includes('following familiar paths')) {
          starters.push('We both prefer familiar topics. What\'s something you enjoy talking about?');
          starters.push('Do you have any favorite books, movies, or shows?');
        }
        break;

      case 'Response Patterns':
        if (insight.description.includes('quick responses')) {
          starters.push('You both respond quickly. What\'s something you\'re thinking about right now?');
          starters.push('Do you have any immediate questions for me?');
        } else if (insight.description.includes('thoughtful replies')) {
          starters.push('We both take time to craft thoughtful replies. What\'s something you\'ve been reflecting on?');
          starters.push('Do you have any deep thoughts you\'d like to share?');
        }
        break;

      case 'Conversation Depth':
        if (insight.description.includes('long conversations')) {
          starters.push('You both enjoy long conversations. What\'s something you\'ve been meaning to talk about?');
          starters.push('Do you have any complex topics you\'d like to discuss?');
        } else if (insight.description.includes('short exchanges')) {
          starters.push('We both prefer shorter exchanges. What\'s something you\'re curious about?');
          starters.push('Do you have any quick questions or thoughts?');
        }
        break;

      case 'Emoji Usage':
        if (insight.description.includes('frequent emoji use')) {
          starters.push('We both use emojis frequently! What\'s something you\'re excited about? 🎉');
          starters.push('Do you have any favorite emojis? 😊');
        } else if (insight.description.includes('minimal emoji use')) {
          starters.push('We both prefer text-based communication. What\'s something you\'ve been thinking about?');
          starters.push('Do you have any interesting observations to share?');
        }
        break;

      case 'Message Length':
        if (insight.description.includes('long messages')) {
          starters.push('We both tend to write longer messages. What\'s something you\'ve been meaning to share?');
          starters.push('Do you have any detailed thoughts or ideas you\'d like to discuss?');
        } else if (insight.description.includes('short messages')) {
          starters.push('We both prefer concise messages. What\'s something you\'re thinking about?');
          starters.push('Do you have any quick questions or thoughts?');
        }
        break;

      case 'Response Time':
        if (insight.description.includes('fast responses')) {
          starters.push('We both respond quickly. What\'s something you\'re thinking about right now?');
          starters.push('Do you have any immediate questions for me?');
        } else if (insight.description.includes('slower responses')) {
          starters.push('We both take our time with responses. What\'s something you\'ve been reflecting on?');
          starters.push('Do you have any thoughtful questions for me?');
        }
        break;

      case 'Session Duration':
        if (insight.description.includes('long sessions')) {
          starters.push('We both enjoy long conversations. What\'s something you\'ve been meaning to talk about?');
          starters.push('Do you have any complex topics you\'d like to discuss?');
        } else if (insight.description.includes('short sessions')) {
          starters.push('We both prefer shorter exchanges. What\'s something you\'re curious about?');
          starters.push('Do you have any quick questions or thoughts?');
        }
        break;
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

  // Add a random element to make it feel more natural
  const randomStarters = [
    'What\'s something you\'re proud of?',
    'Do you have any travel stories to share?',
    'What\'s your favorite way to spend a weekend?',
    'What\'s something that always makes you laugh?',
    'Do you have any hidden talents?'
  ];

  if (starters.length < 5 && Math.random() > 0.5) {
    const randomStarter = randomStarters[Math.floor(Math.random() * randomStarters.length)];
    if (!starters.includes(randomStarter)) {
      starters.push(randomStarter);
    }
  }

  return starters;
};
