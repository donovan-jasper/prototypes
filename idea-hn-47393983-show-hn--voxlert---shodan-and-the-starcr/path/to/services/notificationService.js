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

const generateNarrativeForSocialLike = (notification) => {
  const userMatch = notification.body.match(/([A-Za-z0-9_]+) liked your post/i);
  const user = userMatch ? userMatch[1] : 'someone';

  return `${user} liked your post on ${notification.app}`;
};

const generateNarrativeForSocialComment = (notification) => {
  const userMatch = notification.body.match(/([A-Za-z0-9_]+) commented on your post/i);
  const user = userMatch ? userMatch[1] : 'someone';

  const commentMatch = notification.body.match(/commented: "([^"]+)"/i);
  const comment = commentMatch ? commentMatch[1] : '';

  return `${user} commented on your post${comment ? `: "${comment}"` : ''} on ${notification.app}`;
};

const generateNarrativeForSocialFollow = (notification) => {
  const userMatch = notification.body.match(/([A-Za-z0-9_]+) started following you/i);
  const user = userMatch ? userMatch[1] : 'someone';

  return `${user} started following you on ${notification.app}`;
};

const generateNarrativeForSocialMention = (notification) => {
  const userMatch = notification.body.match(/([A-Za-z0-9_]+) mentioned you/i);
  const user = userMatch ? userMatch[1] : 'someone';

  const postMatch = notification.body.match(/in a post: "([^"]+)"/i);
  const post = postMatch ? postMatch[1] : '';

  return `${user} mentioned you${post ? ` in a post: "${post}"` : ''} on ${notification.app}`;
};

const generateNarrativeForSocial = (notification) => {
  const lowerTitle = notification.title.toLowerCase();
  const lowerBody = notification.body.toLowerCase();

  if (lowerTitle.includes('like') || lowerBody.includes('liked')) {
    return generateNarrativeForSocialLike(notification);
  } else if (lowerTitle.includes('comment') || lowerBody.includes('commented')) {
    return generateNarrativeForSocialComment(notification);
  } else if (lowerTitle.includes('follow') || lowerBody.includes('followed')) {
    return generateNarrativeForSocialFollow(notification);
  } else if (lowerTitle.includes('mention') || lowerBody.includes('mentioned')) {
    return generateNarrativeForSocialMention(notification);
  } else {
    return `New activity on ${notification.app}: ${notification.body.substring(0, 50)}${notification.body.length > 50 ? '...' : ''}`;
  }
};

const generateNarrativeForRideSharing = (notification) => {
  const time = extractTimeFromBody(notification.body);
  const location = extractLocationFromBody(notification.body);

  let narrative = `Your ${notification.app} ride`;

  if (time) {
    narrative += ` is arriving in ${time} minutes`;
  }

  if (location) {
    narrative += ` at ${location}`;
  }

  return narrative;
};

const generateNarrativeForFoodDelivery = (notification) => {
  const time = extractTimeFromBody(notification.body);
  const location = extractLocationFromBody(notification.body);

  let narrative = `Your ${notification.app} order`;

  if (time) {
    narrative += ` will be delivered in ${time} minutes`;
  }

  if (location) {
    narrative += ` to ${location}`;
  }

  return narrative;
};

const generateNarrativeForBanking = (notification) => {
  const amount = extractAmountFromBody(notification.body);
  const transactionType = notification.body.toLowerCase().includes('deposit') ? 'deposit' :
                         notification.body.toLowerCase().includes('withdrawal') ? 'withdrawal' :
                         'transaction';

  let narrative = `New ${transactionType} in your ${notification.app} account`;

  if (amount) {
    narrative += `: $${amount.toFixed(2)}`;
  }

  return narrative;
};

const generateNarrativeForHealth = (notification) => {
  const stepsMatch = notification.body.match(/(\d+)\s*steps/i);
  const caloriesMatch = notification.body.match(/(\d+)\s*calories/i);

  let narrative = `New activity on ${notification.app}`;

  if (stepsMatch) {
    narrative += `: You walked ${stepsMatch[1]} steps`;
  } else if (caloriesMatch) {
    narrative += `: You burned ${caloriesMatch[1]} calories`;
  }

  return narrative;
};

const generateNarrativeForProductivity = (notification) => {
  const eventMatch = notification.body.match(/event:\s*([^\n]+)/i);
  const taskMatch = notification.body.match(/task:\s*([^\n]+)/i);

  let narrative = `New ${notification.app} notification`;

  if (eventMatch) {
    narrative += `: Event - ${eventMatch[1]}`;
  } else if (taskMatch) {
    narrative += `: Task - ${taskMatch[1]}`;
  }

  return narrative;
};

const generateNarrativeForNews = (notification) => {
  const headlineMatch = notification.body.match(/headline:\s*([^\n]+)/i);

  let narrative = `Breaking news from ${notification.app}`;

  if (headlineMatch) {
    narrative += `: ${headlineMatch[1]}`;
  }

  return narrative;
};

const generateNarrativeForMusic = (notification) => {
  const songMatch = notification.body.match(/song:\s*([^\n]+)/i);
  const artistMatch = notification.body.match(/artist:\s*([^\n]+)/i);

  let narrative = `New ${notification.app} notification`;

  if (songMatch && artistMatch) {
    narrative += `: ${songMatch[1]} by ${artistMatch[1]}`;
  } else if (songMatch) {
    narrative += `: ${songMatch[1]}`;
  }

  return narrative;
};

const generateNarrativeForDefault = (notification) => {
  return `New notification from ${notification.app}: ${notification.body.substring(0, 50)}${notification.body.length > 50 ? '...' : ''}`;
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
    return generateNarrativeForDefault(notification);
  }
};

const processNotification = (notification) => {
  const narrative = generateNarrativeText(notification);

  return {
    original: notification,
    narrative: narrative,
    timestamp: new Date().toISOString(),
    category: Object.keys(CATEGORIZATION_RULES).find(key =>
      CATEGORIZATION_RULES[key](notification)
    ) || 'other'
  };
};

export {
  processNotification,
  generateNarrativeText,
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
};
