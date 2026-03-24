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
  // Handle formats like "John Doe:" or "John Doe -"
  const match = title.match(/^([^-:]+)[:\s-]/);
  return match ? match[1].trim() : null;
};

const extractTimeFromBody = (body) => {
  // Look for time patterns like "in 5 minutes", "arriving in 10 mins", etc.
  const timeMatch = body.match(/(?:in|arriving in|will arrive in)\s*(\d+)\s*(min|minute|minut|mins)/i);
  if (timeMatch) {
    return parseInt(timeMatch[1]);
  }
  return null;
};

const extractLocationFromBody = (body) => {
  // Look for location patterns
  const locationMatch = body.match(/(?:at|to|destination:)\s*([^.,]+)/i);
  return locationMatch ? locationMatch[1].trim() : null;
};

const extractAmountFromBody = (body) => {
  // Look for monetary amounts
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
  
  if (time !== null) {
    return `Your ${notification.app} ride will arrive in ${time} minutes`;
  } else if (location) {
    return `Your ${notification.app} ride is heading to ${location}`;
  } else {
    return `Update from ${notification.app}: ${notification.body}`;
  }
};

const generateNarrativeForFoodDelivery = (notification) => {
  const time = extractTimeFromBody(notification.body);
  const location = extractLocationFromBody(notification.body);
  
  if (time !== null) {
    return `Your food delivery will arrive in ${time} minutes`;
  } else if (location) {
    return `Your order is being delivered to ${location}`;
  } else {
    return `Food delivery update: ${notification.body}`;
  }
};

const generateNarrativeForBanking = (notification) => {
  const amount = extractAmountFromBody(notification.body);
  
  if (amount !== null) {
    return `Bank transaction: $${amount.toFixed(2)}. ${notification.body}`;
  } else {
    return `Banking alert: ${notification.body}`;
  }
};

const generateNarrativeForHealth = (notification) => {
  return `Health update from ${notification.app}: ${notification.body}`;
};

const generateNarrativeForProductivity = (notification) => {
  return `Task or calendar update: ${notification.body}`;
};

const generateNarrativeForNews = (notification) => {
  return `Latest news from ${notification.app}: ${notification.body.substring(0, 60)}${notification.body.length > 60 ? '...' : ''}`;
};

const generateNarrativeForMusic = (notification) => {
  return `Music update from ${notification.app}: ${notification.body}`;
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
  music: generateNarrativeForMusic
};

export const categorizeNotification = (notification) => {
  for (const [category, rule] of Object.entries(CATEGORIZATION_RULES)) {
    if (rule(notification)) {
      return category;
    }
  }
  return 'other';
};

export const generateNarrativeText = (notification) => {
  const category = categorizeNotification(notification);
  
  if (NARRATIVE_GENERATORS[category]) {
    return NARRATIVE_GENERATORS[category](notification);
  }
  
  // Default fallback
  return `${notification.app} notification: ${notification.title} - ${notification.body}`;
};

export const processNotification = (rawNotification) => {
  // Extract key information from the notification
  const notificationData = {
    app: rawNotification.request?.content?.data?.appName || 
         rawNotification.request?.content?.title || 
         'Unknown App',
    title: rawNotification.request?.content?.title || '',
    body: rawNotification.request?.content?.body || '',
    timestamp: Date.now(),
    raw: rawNotification
  };

  // Categorize the notification
  const category = categorizeNotification(notificationData);
  
  // Generate narrative text
  const narrative = generateNarrativeText(notificationData);

  // Add processed data to the notification object
  notificationData.category = category;
  notificationData.narrative = narrative;

  return notificationData;
};
