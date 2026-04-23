const generateNarrativeText = (notificationData) => {
  const { app, action, details } = notificationData;

  // Handle different app categories with specific narratives
  switch (app.toLowerCase()) {
    case 'email':
    case 'gmail':
    case 'outlook':
    case 'yahoo mail':
    case 'apple mail':
      return generateEmailNarrative(details);

    case 'whatsapp':
    case 'messenger':
    case 'telegram':
    case 'signal':
    case 'discord':
    case 'slack':
      return generateMessagingNarrative(details);

    case 'facebook':
    case 'instagram':
    case 'twitter':
    case 'linkedin':
    case 'tiktok':
      return generateSocialNarrative(details);

    case 'uber':
    case 'lyft':
    case 'bolt':
    case 'grab':
      return generateRideSharingNarrative(details);

    case 'uber eats':
    case 'doordash':
    case 'grubhub':
    case 'postmates':
    case 'deliveroo':
      return generateFoodDeliveryNarrative(details);

    case 'chase':
    case 'bank of america':
    case 'wells fargo':
    case 'paypal':
    case 'venmo':
      return generateBankingNarrative(details);

    case 'myfitnesspal':
    case 'strava':
    case 'fitbit':
    case 'apple health':
      return generateHealthNarrative(details);

    case 'google calendar':
    case 'todoist':
    case 'notion':
    case 'trello':
      return generateProductivityNarrative(details);

    case 'bbc news':
    case 'cnn':
    case 'reuters':
    case 'nytimes':
      return generateNewsNarrative(details);

    case 'spotify':
    case 'apple music':
    case 'pandora':
    case 'youtube music':
      return generateMusicNarrative(details);

    default:
      return generateDefaultNarrative(notificationData);
  }
};

const generateEmailNarrative = (details) => {
  const sender = extractSender(details.title) || extractSender(details.body) || 'unknown sender';
  const subject = extractSubject(details.title) || extractSubject(details.body) || 'no subject';

  return `You have a new email from ${sender} with the subject: ${subject}. The message says: ${details.body.substring(0, 100)}${details.body.length > 100 ? '...' : ''}`;
};

const generateMessagingNarrative = (details) => {
  const sender = extractSender(details.title) || extractSender(details.body) || 'unknown contact';

  return `New message from ${sender} on ${details.app}: ${details.body}`;
};

const generateSocialNarrative = (details) => {
  const action = extractAction(details.title) || extractAction(details.body) || 'new activity';

  return `You have ${action} on ${details.app}. ${details.body}`;
};

const generateRideSharingNarrative = (details) => {
  const time = extractTime(details.body);
  const location = extractLocation(details.body);

  if (time && location) {
    return `Your ride is arriving in ${time} minutes at ${location}`;
  } else if (time) {
    return `Your ride is arriving in ${time} minutes`;
  } else if (location) {
    return `Your ride is at ${location}`;
  } else {
    return `New update from ${details.app}: ${details.body}`;
  }
};

const generateFoodDeliveryNarrative = (details) => {
  const time = extractTime(details.body);
  const location = extractLocation(details.body);

  if (time && location) {
    return `Your food order will arrive in ${time} minutes at ${location}`;
  } else if (time) {
    return `Your food order will arrive in ${time} minutes`;
  } else if (location) {
    return `Your food order is at ${location}`;
  } else {
    return `New update from ${details.app}: ${details.body}`;
  }
};

const generateBankingNarrative = (details) => {
  const amount = extractAmount(details.body);
  const transactionType = extractTransactionType(details.body);

  if (amount && transactionType) {
    return `You have a ${transactionType} transaction of $${amount} in your ${details.app} account`;
  } else if (amount) {
    return `You have a transaction of $${amount} in your ${details.app} account`;
  } else {
    return `New update from ${details.app}: ${details.body}`;
  }
};

const generateHealthNarrative = (details) => {
  const metric = extractHealthMetric(details.body);

  if (metric) {
    return `Your ${metric.type} has ${metric.change} to ${metric.value}`;
  } else {
    return `New health update from ${details.app}: ${details.body}`;
  }
};

const generateProductivityNarrative = (details) => {
  const event = extractEvent(details.title) || extractEvent(details.body);

  if (event) {
    return `You have a ${event.type} scheduled for ${event.time} titled: ${event.title}`;
  } else {
    return `New update from ${details.app}: ${details.body}`;
  }
};

const generateNewsNarrative = (details) => {
  const headline = extractHeadline(details.title) || extractHeadline(details.body);

  if (headline) {
    return `Breaking news: ${headline}. ${details.body.substring(0, 100)}${details.body.length > 100 ? '...' : ''}`;
  } else {
    return `New news update from ${details.app}: ${details.body}`;
  }
};

const generateMusicNarrative = (details) => {
  const track = extractTrack(details.title) || extractTrack(details.body);

  if (track) {
    return `Now playing: ${track} on ${details.app}`;
  } else {
    return `New music update from ${details.app}: ${details.body}`;
  }
};

const generateDefaultNarrative = (notificationData) => {
  return `New notification from ${notificationData.app}: ${notificationData.details.body}`;
};

// Helper functions for extracting information from notification content
const extractSender = (text) => {
  const patterns = [
    /^([^:]+):/, // "John Doe: message"
    /from:\s*([^\s]+)/i, // "from: John Doe"
    /by:\s*([^\s]+)/i, // "by: John Doe"
    /^([^-]+)-/ // "John Doe - message"
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
};

const extractSubject = (text) => {
  const patterns = [
    /subject:\s*(.+)/i,
    /re:\s*(.+)/i,
    /^([^-]+)-/ // "Subject - message"
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
};

const extractAction = (text) => {
  const patterns = [
    /liked your post/i,
    /commented on your post/i,
    /mentioned you/i,
    /followed you/i,
    /shared your post/i
  ];

  for (const pattern of patterns) {
    if (pattern.test(text)) {
      return text.match(pattern)[0].toLowerCase();
    }
  }
  return null;
};

const extractTime = (text) => {
  const timeMatch = text.match(/(?:in|arriving in|will arrive in)\s*(\d+)\s*(min|minute|minut|mins)/i);
  if (timeMatch) {
    return parseInt(timeMatch[1]);
  }
  return null;
};

const extractLocation = (text) => {
  const locationMatch = text.match(/(?:at|to|destination:)\s*([^.,]+)/i);
  return locationMatch ? locationMatch[1].trim() : null;
};

const extractAmount = (text) => {
  const amountMatch = text.match(/\$?(\d+(?:\.\d{2})?)/);
  return amountMatch ? parseFloat(amountMatch[1]) : null;
};

const extractTransactionType = (text) => {
  const patterns = [
    /deposit/i,
    /withdrawal/i,
    /payment/i,
    /transfer/i,
    /charge/i,
    /refund/i
  ];

  for (const pattern of patterns) {
    if (pattern.test(text)) {
      return text.match(pattern)[0].toLowerCase();
    }
  }
  return null;
};

const extractHealthMetric = (text) => {
  const patterns = [
    { type: 'step count', pattern: /(\d+)\s*steps/i },
    { type: 'calorie count', pattern: /(\d+)\s*calories/i },
    { type: 'distance', pattern: /(\d+\.?\d*)\s*(km|kilometer|mile|miles)/i },
    { type: 'heart rate', pattern: /(\d+)\s*bpm/i }
  ];

  for (const item of patterns) {
    const match = text.match(item.pattern);
    if (match) {
      const value = match[1];
      const change = text.includes('increased') ? 'increased' :
                    text.includes('decreased') ? 'decreased' :
                    'changed to';
      return { type: item.type, value, change };
    }
  }
  return null;
};

const extractEvent = (text) => {
  const patterns = [
    { type: 'meeting', pattern: /meeting\s*(?:at|on)\s*([\d:]+)/i },
    { type: 'appointment', pattern: /appointment\s*(?:at|on)\s*([\d:]+)/i },
    { type: 'task', pattern: /task\s*due\s*(?:at|on)\s*([\d:]+)/i },
    { type: 'reminder', pattern: /reminder\s*(?:at|on)\s*([\d:]+)/i }
  ];

  for (const item of patterns) {
    const match = text.match(item.pattern);
    if (match) {
      return {
        type: item.type,
        time: match[1],
        title: text.replace(item.pattern, '').trim()
      };
    }
  }
  return null;
};

const extractHeadline = (text) => {
  const patterns = [
    /^([^.!?]+)[.!?]/, // First sentence
    /"([^"]+)"/, // Quoted text
    /^([^-]+)-/ // "Headline - rest of text"
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
};

const extractTrack = (text) => {
  const patterns = [
    /now playing:\s*(.+)/i,
    /playing:\s*(.+)/i,
    /"([^"]+)"\s*by/i,
    /^([^-]+)-/ // "Track - Artist"
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
};

export {
  generateNarrativeText
};
