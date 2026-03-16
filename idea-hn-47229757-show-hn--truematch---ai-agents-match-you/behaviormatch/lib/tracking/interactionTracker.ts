import { logInteraction } from '../database/queries';

export const trackInteraction = async (userId, type, metadata) => {
  // Check privacy settings before tracking
  if (shouldTrackInteraction(type)) {
    await logInteraction(userId, type, metadata);
  }
};

const shouldTrackInteraction = (type) => {
  // Implement logic to check privacy settings
  // For demonstration, we'll assume all interactions are tracked
  return true;
};

export const trackMessageSend = async (userId, message) => {
  const metadata = {
    length: message.length,
    response_time: calculateResponseTime(message),
    timestamp: new Date().toISOString(),
  };

  await trackInteraction(userId, 'message_send', metadata);
};

const calculateResponseTime = (message) => {
  // Implement logic to calculate response time
  // For demonstration, we'll return a random value
  return Math.floor(Math.random() * 60) + 1; // 1-60 seconds
};

export const trackAppUsage = async (userId, session) => {
  const metadata = {
    duration: session.duration,
    hour: new Date().getHours(),
    timestamp: new Date().toISOString(),
  };

  await trackInteraction(userId, 'app_usage', metadata);
};

export const trackSwipeAction = async (userId, swipe) => {
  const metadata = {
    direction: swipe.direction,
    speed: swipe.speed,
    timestamp: new Date().toISOString(),
  };

  await trackInteraction(userId, 'swipe_action', metadata);
};
