import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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
    return `Your ${notification.app} ride is arriving in ${time} minutes at ${location}`;
  } else if (time) {
    return `Your ${notification.app} ride is arriving in ${time} minutes`;
  } else if (location) {
    return `Your ${notification.app} ride is at ${location}`;
  } else {
    return `New update from ${notification.app}: ${notification.body}`;
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
    return `New update from ${notification.app}: ${notification.body}`;
  }
};

const generateNarrativeForBanking = (notification) => {
  const amount = extractAmountFromBody(notification.body);
  const transactionMatch = notification.body.match(/(deposit|withdrawal|payment|transfer|charge)/i);
  const transactionType = transactionMatch ? transactionMatch[1] : 'transaction';

  if (amount && transactionType) {
    return `You have a ${transactionType} of $${amount} in your ${notification.app} account`;
  } else if (amount) {
    return `You have a transaction of $${amount} in your ${notification.app} account`;
  } else {
    return `New update from ${notification.app}: ${notification.body}`;
  }
};

const generateDefaultNarrative = (notification) => {
  return `New notification from ${notification.app}: ${notification.title}. ${notification.body}`;
};

export const processNotification = (notification) => {
  if (!notification || !notification.request || !notification.request.content) {
    return null;
  }

  const content = notification.request.content;
  const appName = content.data?.appName || 'unknown app';

  const processed = {
    app: appName,
    title: content.title || '',
    body: content.body || '',
    data: content.data || {},
    timestamp: notification.date || new Date().toISOString()
  };

  // Determine notification category
  for (const [category, rule] of Object.entries(CATEGORIZATION_RULES)) {
    if (rule(processed)) {
      processed.category = category;
      break;
    }
  }

  return processed;
};

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const setupNotificationListener = () => {
  // This is now handled in the NotificationHandler component
};
