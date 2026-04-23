import { generateCompatibilityInsights } from './matchingEngine';

interface CompatibilityInsight {
  title: string;
  description: string;
  score: number;
}

interface BehaviorVector {
  communicationStyle: {
    deepConversations: number;
    quickExchanges: number;
  };
  energyLevels: {
    consistentEngagement: number;
    shortBursts: number;
  };
  interactionPreferences: {
    exploringNewTopics: number;
    followingFamiliarPaths: number;
  };
  responsePatterns: {
    quickResponses: number;
    thoughtfulReplies: number;
  };
  conversationDepth: {
    longConversations: number;
    shortExchanges: number;
  };
  emojiUsage: {
    frequent: number;
    minimal: number;
  };
  messageLength: {
    longMessages: number;
    shortMessages: number;
  };
  responseTime: {
    fastResponses: number;
    slowResponses: number;
  };
}

const getUserBehaviorVector = async (): Promise<BehaviorVector> => {
  // In a real implementation, this would fetch from local storage
  // For this example, we'll return a mock vector
  return {
    communicationStyle: {
      deepConversations: 0.7,
      quickExchanges: 0.3
    },
    energyLevels: {
      consistentEngagement: 0.6,
      shortBursts: 0.4
    },
    interactionPreferences: {
      exploringNewTopics: 0.5,
      followingFamiliarPaths: 0.5
    },
    responsePatterns: {
      quickResponses: 0.4,
      thoughtfulReplies: 0.6
    },
    conversationDepth: {
      longConversations: 0.6,
      shortExchanges: 0.4
    },
    emojiUsage: {
      frequent: 0.3,
      minimal: 0.7
    },
    messageLength: {
      longMessages: 0.5,
      shortMessages: 0.5
    },
    responseTime: {
      fastResponses: 0.4,
      slowResponses: 0.6
    }
  };
};

const getMatchBehaviorVector = async (matchId: string): Promise<BehaviorVector> => {
  // In a real implementation, this would fetch from the server
  // For this example, we'll return a mock vector
  return {
    communicationStyle: {
      deepConversations: 0.6,
      quickExchanges: 0.4
    },
    energyLevels: {
      consistentEngagement: 0.5,
      shortBursts: 0.5
    },
    interactionPreferences: {
      exploringNewTopics: 0.4,
      followingFamiliarPaths: 0.6
    },
    responsePatterns: {
      quickResponses: 0.5,
      thoughtfulReplies: 0.5
    },
    conversationDepth: {
      longConversations: 0.5,
      shortExchanges: 0.5
    },
    emojiUsage: {
      frequent: 0.4,
      minimal: 0.6
    },
    messageLength: {
      longMessages: 0.4,
      shortMessages: 0.6
    },
    responseTime: {
      fastResponses: 0.5,
      slowResponses: 0.5
    }
  };
};

const generateStartersFromInsight = (insight: CompatibilityInsight): string[] => {
  const starters: string[] = [];

  switch (insight.title) {
    case 'Communication Style':
      if (insight.score > 0.6) {
        if (insight.description.includes('deep conversations')) {
          starters.push('We both enjoy deep conversations. What\'s something you\'ve been thinking about lately?');
          starters.push('Do you have any philosophical questions you\'d like to discuss?');
          starters.push('What\'s a topic you\'re passionate about that we could explore together?');
        } else if (insight.description.includes('quick exchanges')) {
          starters.push('We both prefer quick exchanges. What\'s something interesting you\'ve learned recently?');
          starters.push('Do you have any fun facts to share?');
          starters.push('What\'s the last thing that made you laugh out loud?');
        }
      }
      break;

    case 'Energy Levels':
      if (insight.score > 0.6) {
        if (insight.description.includes('consistent engagement')) {
          starters.push('We both stay engaged for a while. What keeps you interested in conversations?');
          starters.push('Do you have any long-term projects or goals you\'re working on?');
          starters.push('What\'s something you\'ve been meaning to talk about for a while?');
        } else if (insight.description.includes('short bursts')) {
          starters.push('We both have short bursts of energy. What\'s something exciting you\'re working on?');
          starters.push('Do you have any quick questions or thoughts you\'d like to share?');
          starters.push('What\'s the last thing that caught your attention?');
        }
      }
      break;

    case 'Interaction Preferences':
      if (insight.score > 0.6) {
        if (insight.description.includes('exploring new topics')) {
          starters.push('We both enjoy exploring new topics. What\'s something you\'d like to learn more about?');
          starters.push('Do you have any unusual hobbies or interests?');
          starters.push('What\'s a topic you\'ve always wanted to understand better?');
        } else if (insight.description.includes('following familiar paths')) {
          starters.push('We both prefer familiar topics. What\'s something you enjoy talking about?');
          starters.push('Do you have any favorite books, movies, or shows?');
          starters.push('What\'s your go-to topic when you want to chat?');
        }
      }
      break;

    case 'Response Patterns':
      if (insight.score > 0.6) {
        if (insight.description.includes('quick responses')) {
          starters.push('You both respond quickly. What\'s something you\'re thinking about right now?');
          starters.push('Do you have any immediate questions for me?');
          starters.push('What\'s the first thing that comes to mind when we think about this?');
        } else if (insight.description.includes('thoughtful replies')) {
          starters.push('We both take time to craft thoughtful replies. What\'s something you\'ve been reflecting on?');
          starters.push('Do you have any deep thoughts you\'d like to share?');
          starters.push('What\'s a question that\'s been on your mind lately?');
        }
      }
      break;

    case 'Conversation Depth':
      if (insight.score > 0.6) {
        if (insight.description.includes('long conversations')) {
          starters.push('You both enjoy long conversations. What\'s something you\'ve been meaning to talk about?');
          starters.push('Do you have any complex topics you\'d like to discuss?');
          starters.push('What\'s a topic you could talk about for hours?');
        } else if (insight.description.includes('short exchanges')) {
          starters.push('We both prefer shorter exchanges. What\'s something you\'re curious about?');
          starters.push('Do you have any quick questions or thoughts?');
          starters.push('What\'s a topic we could discuss in just a few messages?');
        }
      }
      break;

    case 'Emoji Usage':
      if (insight.score > 0.6) {
        if (insight.description.includes('frequent emoji use')) {
          starters.push('We both use emojis frequently! What\'s something you\'re excited about? 🎉');
          starters.push('Do you have any favorite emojis? 😊');
          starters.push('What\'s something that makes you smile? 😊');
        } else if (insight.description.includes('minimal emoji use')) {
          starters.push('We both prefer text-based communication. What\'s something you\'ve been thinking about?');
          starters.push('Do you have any interesting observations to share?');
          starters.push('What\'s a topic you could discuss without needing emojis?');
        }
      }
      break;

    case 'Message Length':
      if (insight.score > 0.6) {
        if (insight.description.includes('long messages')) {
          starters.push('We both tend to write longer messages. What\'s something you\'ve been meaning to share?');
          starters.push('Do you have any detailed thoughts or ideas you\'d like to discuss?');
          starters.push('What\'s a topic you could write a paragraph about?');
        } else if (insight.description.includes('short messages')) {
          starters.push('We both prefer concise messages. What\'s something you\'re thinking about?');
          starters.push('Do you have any quick questions or thoughts?');
          starters.push('What\'s a topic we could discuss in one sentence?');
        }
      }
      break;

    case 'Response Time':
      if (insight.score > 0.6) {
        if (insight.description.includes('fast responses')) {
          starters.push('We both respond quickly. What\'s something you\'re thinking about right now?');
          starters.push('Do you have any immediate questions for me?');
          starters.push('What\'s the first thing that comes to mind when we think about this?');
        } else if (insight.description.includes('slow responses')) {
          starters.push('We both take our time with replies. What\'s something you\'ve been reflecting on?');
          starters.push('Do you have any deep thoughts you\'d like to share?');
          starters.push('What\'s a question that\'s been on your mind lately?');
        }
      }
      break;
  }

  return starters;
};

export const generateConversationStarters = async (matchId: string): Promise<string[]> => {
  const userVector = await getUserBehaviorVector();
  const matchVector = await getMatchBehaviorVector(matchId);

  const insights = generateCompatibilityInsights(userVector, matchVector);

  // Filter insights with high scores (> 0.6) and generate starters
  const highScoreInsights = insights.filter(insight => insight.score > 0.6);

  if (highScoreInsights.length === 0) {
    // Fallback starters if no high-score insights
    return [
      'What\'s something you\'re really passionate about?',
      'Do you have any interesting hobbies or interests?',
      'What\'s a topic you could talk about for hours?',
      'What\'s something that makes you smile?',
      'What\'s a question you\'ve always wanted to ask?'
    ];
  }

  // Generate starters from high-score insights
  let starters: string[] = [];
  highScoreInsights.forEach(insight => {
    starters = [...starters, ...generateStartersFromInsight(insight)];
  });

  // If we have fewer than 3 starters, add some generic ones
  if (starters.length < 3) {
    const genericStarters = [
      'What\'s something you\'re really passionate about?',
      'Do you have any interesting hobbies or interests?',
      'What\'s a topic you could talk about for hours?',
      'What\'s something that makes you smile?',
      'What\'s a question you\'ve always wanted to ask?'
    ];

    // Add generic starters until we have at least 3
    while (starters.length < 3) {
      const randomStarter = genericStarters[Math.floor(Math.random() * genericStarters.length)];
      if (!starters.includes(randomStarter)) {
        starters.push(randomStarter);
      }
    }
  }

  // Return up to 5 unique starters
  return [...new Set(starters)].slice(0, 5);
};
