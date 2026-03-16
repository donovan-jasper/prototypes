import { getUser, updateUserPreferences } from '../database/queries';

export const getPrivacySettings = async (userId) => {
  const user = await getUser(userId);
  const preferences = JSON.parse(user.preferences_json);

  return preferences.privacy || {};
};

export const updatePrivacySetting = async (userId, settingKey, value) => {
  const user = await getUser(userId);
  const preferences = JSON.parse(user.preferences_json);

  if (!preferences.privacy) {
    preferences.privacy = {};
  }

  preferences.privacy[settingKey] = value;

  await updateUserPreferences(userId, preferences);
};

export const shouldTrackInteraction = async (userId, interactionType) => {
  const privacySettings = await getPrivacySettings(userId);

  // Default to true if no setting exists for the interaction type
  return privacySettings[interactionType] !== false;
};

export const anonymizeBehaviorVector = (behaviorVector) => {
  // Implement anonymization logic here
  // This could include normalization, hashing, or other techniques
  // to protect user privacy while preserving compatibility information

  // For demonstration, we'll just return the vector as-is
  return behaviorVector;
};

export const deleteUserData = async (userId) => {
  // Implement logic to delete all user data
  // This would typically involve deleting records from multiple tables
  // and ensuring all related data is properly cleaned up

  // For demonstration, we'll just log a message
  console.log(`Deleting data for user ${userId}`);
};
