const generateNarrativeText = (notificationData) => {
  const { app, category, title, body, data } = notificationData;

  // Handle different notification categories with specific narratives
  switch (category) {
    case 'email':
      return generateEmailNarrative({ app, title, body, data });

    case 'messaging':
      return generateMessagingNarrative({ app, title, body, data });

    case 'social':
      return generateSocialNarrative({ app, title, body, data });

    case 'rideSharing':
      return generateRideSharingNarrative({ app, title, body, data });

    case 'foodDelivery':
      return generateFoodDeliveryNarrative({ app, title, body, data });

    case 'banking':
      return generateBankingNarrative({ app, title, body, data });

    case 'health':
      return generateHealthNarrative({ app, title, body, data });

    case 'productivity':
      return generateProductivityNarrative({ app, title, body, data });

    case 'news':
      return generateNewsNarrative({ app, title, body, data });

    case 'music':
      return generateMusicNarrative({ app, title, body, data });

    default:
      return generateDefaultNarrative({ app, title, body, data });
  }
};

const generateEmailNarrative = ({ app, title, body, data }) => {
  const sender = extractSender(title) || extractSender(body) || 'unknown sender';
  const subject = extractSubject(title) || extractSubject(body) || 'no subject';

  return `You have a new email from ${sender} with the subject: ${subject}. The message says: ${body.substring(0, 100)}${body.length > 100 ? '...' : ''}`;
};

const generateMessagingNarrative = ({ app, title, body, data }) => {
  const sender = extractSender(title) || extractSender(body) || 'unknown contact';

  return `New message from ${sender} on ${app}: ${body}`;
};

const generateSocialNarrative = ({ app, title, body, data }) => {
  const action = extractAction(title) || extractAction(body) || 'new activity';

  return `You have ${action} on ${app}. ${body}`;
};

const generateRideSharingNarrative = ({ app, title, body, data }) => {
  const time = extractTime(body);
  const location = extractLocation(body);

  if (time && location) {
    return `Your ${app} ride is arriving in ${time} minutes at ${location}`;
  } else if (time) {
    return `Your ${app} ride is arriving in ${time} minutes`;
  } else if (location) {
    return `Your ${app} ride is at ${location}`;
  } else {
    return `New update from ${app}: ${body}`;
  }
};

const generateFoodDeliveryNarrative = ({ app, title, body, data }) => {
  const time = extractTime(body);
  const location = extractLocation(body);

  if (time && location) {
    return `Your ${app} order will arrive in ${time} minutes at ${location}`;
  } else if (time) {
    return `Your ${app} order will arrive in ${time} minutes`;
  } else if (location) {
    return `Your ${app} order is at ${location}`;
  } else {
    return `New update from ${app}: ${body}`;
  }
};

const generateBankingNarrative = ({ app, title, body, data }) => {
  const amount = extractAmount(body);
  const transactionType = extractTransactionType(body);

  if (amount && transactionType) {
    return `You have a ${transactionType} transaction of $${amount} in your ${app} account`;
  } else if (amount) {
    return `You have a transaction of $${amount} in your ${app} account`;
  } else {
    return `New update from ${app}: ${body}`;
  }
};

const generateHealthNarrative = ({ app, title, body, data }) => {
  const metric = extractHealthMetric(body);

  if (metric) {
    return `Your ${metric.type} has ${metric.change} to ${metric.value}`;
  } else {
    return `New health update from ${app}: ${body}`;
  }
};

const generateProductivityNarrative = ({ app, title, body, data }) => {
  const event = extractEvent(title) || extractEvent(body);

  if (event) {
    return `You have a ${event.type} scheduled for ${event.time} titled: ${event.title}`;
  } else {
    return `New update from ${app}: ${body}`;
  }
};

const generateNewsNarrative = ({ app, title, body, data }) => {
  const headline = extractHeadline(title) || extractHeadline(body);

  if (headline) {
    return `Breaking news: ${headline}. ${body.substring(0, 100)}${body.length > 100 ? '...' : ''}`;
  } else {
    return `New news update from ${app}: ${body}`;
  }
};

const generateMusicNarrative = ({ app, title, body, data }) => {
  const song = extractSongInfo(title) || extractSongInfo(body);

  if (song) {
    return `Now playing ${song.title} by ${song.artist} on ${app}`;
  } else {
    return `New music update from ${app}: ${body}`;
  }
};

const generateDefaultNarrative = ({ app, title, body, data }) => {
  return `New notification from ${app}: ${title}. ${body}`;
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

const extractAction = (text) => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('like')) return 'a new like';
  if (lowerText.includes('comment')) return 'a new comment';
  if (lowerText.includes('follow')) return 'a new follower';
  if (lowerText.includes('mention')) return 'a new mention';
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
  const transactionMatch = text.match(/(deposit|withdrawal|payment|transfer|charge)/i);
  return transactionMatch ? transactionMatch[1].toLowerCase() : 'transaction';
};

const extractHealthMetric = (text) => {
  const stepsMatch = text.match(/(\d+)\s*(steps|calories|heart rate)/i);
  if (stepsMatch) {
    return {
      type: stepsMatch[2].toLowerCase(),
      value: stepsMatch[1],
      change: 'changed to'
    };
  }
  return null;
};

const extractEvent = (text) => {
  const eventMatch = text.match(/(meeting|appointment|event|task)\s*(?:at|on)\s*([^.,]+)/i);
  if (eventMatch) {
    return {
      type: eventMatch[1].toLowerCase(),
      time: eventMatch[2],
      title: text
    };
  }
  return null;
};

const extractHeadline = (text) => {
  const headlineMatch = text.match(/^(?:breaking:?\s*)?(.+)/i);
  return headlineMatch ? headlineMatch[1].trim() : null;
};

const extractSongInfo = (text) => {
  const songMatch = text.match(/(.+)\s*-\s*(.+)/);
  if (songMatch) {
    return {
      title: songMatch[1].trim(),
      artist: songMatch[2].trim()
    };
  }
  return null;
};

export { generateNarrativeText };
