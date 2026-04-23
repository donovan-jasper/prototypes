import {
  generateNarrativeForEmail,
  generateNarrativeForMessaging,
  generateNarrativeForSocial,
  generateNarrativeForRideSharing,
  generateNarrativeForFoodDelivery,
  generateNarrativeForBanking,
  generateNarrativeForHealth,
  generateNarrativeForProductivity,
  generateNarrativeForNews,
  generateNarrativeForMusic
} from './notificationService';

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

const generateNarrativeText = (notification) => {
  if (CATEGORIZATION_RULES.email(notification)) {
    return generateNarrativeForEmail(notification);
  } else if (CATEGORIZATION_RULES.messaging(notification)) {
    return generateNarrativeForMessaging(notification);
  } else if (CATEGORIZATION_RULES.social(notification)) {
    return generateNarrativeForSocial(notification);
  } else if (CATEGORIZATION_RULES.rideSharing(notification)) {
    return generateNarrativeForRideSharing(notification);
  } else if (CATEGORIZATION_RULES.foodDelivery(notification)) {
    return generateNarrativeForFoodDelivery(notification);
  } else if (CATEGORIZATION_RULES.banking(notification)) {
    return generateNarrativeForBanking(notification);
  } else if (CATEGORIZATION_RULES.health(notification)) {
    return generateNarrativeForHealth(notification);
  } else if (CATEGORIZATION_RULES.productivity(notification)) {
    return generateNarrativeForProductivity(notification);
  } else if (CATEGORIZATION_RULES.news(notification)) {
    return generateNarrativeForNews(notification);
  } else if (CATEGORIZATION_RULES.music(notification)) {
    return generateNarrativeForMusic(notification);
  } else {
    return `New notification from ${notification.app}: ${notification.body.substring(0, 50)}${notification.body.length > 50 ? '...' : ''}`;
  }
};

const generateContextualAudioDescription = (notification, characterVoice) => {
  const narrative = generateNarrativeText(notification);

  // In a real implementation, this would use the characterVoice to generate appropriate audio
  // For now, we'll just return the narrative text with voice information
  return {
    text: narrative,
    voice: characterVoice,
    timestamp: new Date().toISOString()
  };
};

export {
  generateNarrativeText,
  generateContextualAudioDescription,
  CATEGORIZATION_RULES
};
