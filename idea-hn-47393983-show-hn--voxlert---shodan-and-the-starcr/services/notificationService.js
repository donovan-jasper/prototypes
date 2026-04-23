import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { generateNarrativeText } from './contextService';
import { playNarration } from './audioService';

const APP_CATEGORIES = {
  EMAIL: ['gmail', 'outlook', 'mail', 'yahoo mail', 'apple mail'],
  MESSAGING: ['whatsapp', 'messenger', 'telegram', 'signal', 'discord', 'slack'],
  SOCIAL: ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok'],
  RIDE_SHARING: ['uber', 'lyft', 'bolt', 'grab'],
  FOOD_DELIVERY: ['uber eats', 'doordash', 'grubhub', 'postmates', 'deliveroo'],
  BANKING: ['chase', 'bank of america', 'wells fargo', 'paypal', 'venmo'],
  HEALTH: ['myfitnesspal', 'strava', 'fitbit', 'apple health'],
  PRODUCTIVITY: ['google calendar', 'todoist', 'notion', 'trello'],
  NEWS: ['bbc news', 'cnn', 'reuters', 'nytimes'],
  MUSIC: ['spotify', 'apple music', 'pandora', 'youtube music']
};

const CATEGORIZATION_RULES = {
  email: (notification) => {
    const lowerApp = notification.app.toLowerCase();
    return APP_CATEGORIES.EMAIL.some(emailApp => lowerApp.includes(emailApp));
  },
  messaging: (notification) => {
    const lowerApp = notification.app.toLowerCase();
    return APP_CATEGORIES.MESSAGING.some(messagingApp => lowerApp.includes(messagingApp));
  },
  social: (notification) => {
    const lowerApp = notification.app.toLowerCase();
    return APP_CATEGORIES.SOCIAL.some(socialApp => lowerApp.includes(socialApp));
  },
  rideSharing: (notification) => {
    const lowerApp = notification.app.toLowerCase();
    return APP_CATEGORIES.RIDE_SHARING.some(rideApp => lowerApp.includes(rideApp));
  },
  foodDelivery: (notification) => {
    const lowerApp = notification.app.toLowerCase();
    return APP_CATEGORIES.FOOD_DELIVERY.some(foodApp => lowerApp.includes(foodApp));
  },
  banking: (notification) => {
    const lowerApp = notification.app.toLowerCase();
    return APP_CATEGORIES.BANKING.some(bankApp => lowerApp.includes(bankApp));
  },
  health: (notification) => {
    const lowerApp = notification.app.toLowerCase();
    return APP_CATEGORIES.HEALTH.some(healthApp => lowerApp.includes(healthApp));
  },
  productivity: (notification) => {
    const lowerApp = notification.app.toLowerCase();
    return APP_CATEGORIES.PRODUCTIVITY.some(productivityApp => lowerApp.includes(productivityApp));
  },
  news: (notification) => {
    const lowerApp = notification.app.toLowerCase();
    return APP_CATEGORIES.NEWS.some(newsApp => lowerApp.includes(newsApp));
  },
  music: (notification) => {
    const lowerApp = notification.app.toLowerCase();
    return APP_CATEGORIES.MUSIC.some(musicApp => lowerApp.includes(musicApp));
  }
};

const extractSenderFromTitle = (title) => {
  const match = title.match(/^([^-:]+)[:\s-]/);
  return match ? match[1].trim() : null;
};

const extractTimeFromBody = (body) => {
  const timeMatch = body.match(/(?:in|arriving in|will arrive in)\s*(\d+)\s*(min|minute|minut|mins)/i);
  if (timeMatch) {
    return parseInt(timeMatch[1]);
  }
  return null;
};

const extractLocationFromBody = (body) => {
  const locationMatch = body.match(/(?:at|to|destination:)\s*([^.,]+)/i);
  return locationMatch ? locationMatch[1].trim() : null;
};

const extractAmountFromBody = (body) => {
  const amountMatch = body.match(/\$?(\d+(?:\.\d{2})?)/);
  return amountMatch ? parseFloat(amountMatch[1]) : null;
};

const generateNarrativeForEmail = (notification) => {
  const sender = extractSenderFromTitle(notification.title) ||
                 notification.body.match(/from:\s*([^\s]+)/i)?.[1] ||
                 'unknown sender';

  let narrative = `New email from ${sender}`;

  if (notification.body && notification.body.length > 0) {
    narrative += `: ${notification.body.substring(0, 50)}${notification.body.length > 50 ? '...' : ''}`;
  }

  return narrative;
};

const generateNarrativeForMessaging = (notification) => {
  const sender = extractSenderFromTitle(notification.title) ||
                 notification.body.match(/from:\s*([^\s]+)/i)?.[1] ||
                 'unknown contact';

  let narrative = `New message from ${sender}`;

  if (notification.body && notification.body.length > 0) {
    narrative += `: ${notification.body}`;
  }

  return narrative;
};

const generateNarrativeForSocial = (notification) => {
  const lowerTitle = notification.title.toLowerCase();
  const lowerBody = notification.body.toLowerCase();

  if (lowerTitle.includes('like') || lowerBody.includes('liked')) {
    return `Someone liked your post`;
  } else if (lowerTitle.includes('comment') || lowerBody.includes('commented')) {
    return `Someone commented on your post`;
  } else if (lowerTitle.includes('follow') || lowerBody.includes('followed')) {
    return `New follower`;
  } else if (lowerTitle.includes('mention') || lowerBody.includes('mentioned')) {
    return `You were mentioned in a post`;
  } else {
    return `New activity on ${notification.app}: ${notification.body.substring(0, 50)}${notification.body.length > 50 ? '...' : ''}`;
  }
};

const generateNarrativeForRideSharing = (notification) => {
  const time = extractTimeFromBody(notification.body);
  const location = extractLocationFromBody(notification.body);

  if (time && location) {
    return `Your ${notification.app} is arriving in ${time} minutes at ${location}`;
  } else if (time) {
    return `Your ${notification.app} is arriving in ${time} minutes`;
  } else if (location) {
    return `Your ${notification.app} is at ${location}`;
  } else {
    return `New ${notification.app} update: ${notification.body}`;
  }
};

const generateNarrativeForFoodDelivery = (notification) => {
  const time = extractTimeFromBody(notification.body);
  const location = extractLocationFromBody(notification.body);

  if (time && location) {
    return `Your ${notification.app} order will arrive in ${time} minutes at ${location}`;
  } else if (time) {
    return `Your ${notification.app} order will arrive in ${time} minutes`;
  } else if (location) {
    return `Your ${notification.app} order is at ${location}`;
  } else {
    return `New ${notification.app} update: ${notification.body}`;
  }
};

const generateNarrativeForBanking = (notification) => {
  const amount = extractAmountFromBody(notification.body);

  if (amount) {
    return `New transaction of $${amount} in your ${notification.app} account`;
  } else {
    return `New ${notification.app} update: ${notification.body}`;
  }
};

const generateNarrativeForHealth = (notification) => {
  const lowerBody = notification.body.toLowerCase();

  if (lowerBody.includes('step') || lowerBody.includes('walk')) {
    return `Your step count has been updated`;
  } else if (lowerBody.includes('calorie') || lowerBody.includes('calories')) {
    return `Your calorie count has been updated`;
  } else if (lowerBody.includes('workout') || lowerBody.includes('exercise')) {
    return `Your workout has been recorded`;
  } else {
    return `New ${notification.app} health update: ${notification.body}`;
  }
};

const generateNarrativeForProductivity = (notification) => {
  const lowerTitle = notification.title.toLowerCase();
  const lowerBody = notification.body.toLowerCase();

  if (lowerTitle.includes('meeting') || lowerBody.includes('meeting')) {
    return `You have a meeting scheduled`;
  } else if (lowerTitle.includes('task') || lowerBody.includes('task')) {
    return `New task assigned`;
  } else if (lowerTitle.includes('reminder') || lowerBody.includes('reminder')) {
    return `Reminder: ${notification.body}`;
  } else {
    return `New ${notification.app} update: ${notification.body}`;
  }
};

const generateNarrativeForNews = (notification) => {
  return `Breaking news from ${notification.app}: ${notification.body.substring(0, 50)}${notification.body.length > 50 ? '...' : ''}`;
};

const generateNarrativeForMusic = (notification) => {
  const lowerTitle = notification.title.toLowerCase();
  const lowerBody = notification.body.toLowerCase();

  if (lowerTitle.includes('play') || lowerBody.includes('play')) {
    return `Now playing: ${notification.body}`;
  } else if (lowerTitle.includes('like') || lowerBody.includes('liked')) {
    return `Someone liked your song`;
  } else {
    return `New ${notification.app} music update: ${notification.body}`;
  }
};

const generateNarrativeForDefault = (notification) => {
  return `New notification from ${notification.app}: ${notification.body}`;
};

const NARRATIVE_GENERATORS = {
  email: generateNarrativeForEmail,
  messaging: generateNarrativeForMessaging,
  social: generateNarrativeForSocial,
  rideSharing: generateNarrativeForRideSharing,
  foodDelivery: generateNarrativeForFoodDelivery,
  banking: generateNarrativeForBanking,
  health: generateNarrativeForHealth,
  productivity: generateNarrativeForProductivity,
  news: generateNarrativeForNews,
  music: generateNarrativeForMusic,
  default: generateNarrativeForDefault
};

const categorizeNotification = (notification) => {
  for (const [category, rule] of Object.entries(CATEGORIZATION_RULES)) {
    if (rule(notification)) {
      return category;
    }
  }
  return 'default';
};

const processNotification = (notification) => {
  const category = categorizeNotification(notification);
  const generator = NARRATIVE_GENERATORS[category] || NARRATIVE_GENERATORS.default;
  const narrative = generator(notification);

  return {
    original: notification,
    category,
    narrative
  };
};

const setupNotificationListener = () => {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  Notifications.addNotificationReceivedListener(async (notification) => {
    try {
      const processed = processNotification({
        app: notification.request.content.data?.app || 'Unknown App',
        title: notification.request.content.title || '',
        body: notification.request.content.body || ''
      });

      const narrative = generateNarrativeText({
        app: processed.original.app,
        action: processed.category,
        details: {
          title: processed.original.title,
          body: processed.original.body
        }
      });

      await playNarration(narrative);
    } catch (error) {
      console.error('Error processing notification:', error);
    }
  });

  Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('Notification response received:', response);
  });
};

const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Notification permissions not granted');
    return false;
  }
  return true;
};

export {
  processNotification,
  setupNotificationListener,
  requestNotificationPermissions,
  categorizeNotification
};
