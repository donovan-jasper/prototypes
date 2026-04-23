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

export const processNotification = (notification) => {
  try {
    // Extract basic notification data
    const { title, body, data } = notification.request.content;
    const app = notification.request.content.sender || 'unknown app';

    // Determine notification category
    let category = 'default';
    for (const [cat, rule] of Object.entries(CATEGORIZATION_RULES)) {
      if (rule({ app, title, body, data })) {
        category = cat;
        break;
      }
    }

    // Return processed notification data
    return {
      app,
      category,
      title,
      body,
      data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error processing notification:', error);
    return null;
  }
};

// Helper functions
const extractSender = (text) => {
  const match = text.match(/^([^-:]+)[:\s-]/);
  return match ? match[1].trim() : null;
};

const extractSubject = (text) => {
  const match = text.match(/^(?:from|re:)\s*(.+)/i);
  return match ? match[1].trim() : null;
};

const extractTime = (text) => {
  const match = text.match(/(?:in|arriving in|will arrive in)\s*(\d+)\s*(min|minute|minut|mins)/i);
  return match ? parseInt(match[1]) : null;
};

const extractLocation = (text) => {
  const match = text.match(/(?:at|to|destination:)\s*([^.,]+)/i);
  return match ? match[1].trim() : null;
};

const extractAmount = (text) => {
  const match = text.match(/\$?(\d+(?:\.\d{2})?)/);
  return match ? parseFloat(match[1]) : null;
};

const extractAction = (text) => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('like')) return 'like';
  if (lowerText.includes('comment')) return 'comment';
  if (lowerText.includes('follow')) return 'follow';
  if (lowerText.includes('mention')) return 'mention';
  return null;
};
