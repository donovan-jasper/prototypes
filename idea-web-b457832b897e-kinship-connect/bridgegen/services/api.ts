const API_BASE_URL = 'https://api.bridgegen.com';

export const fetchMatches = async (userId) => {
  // Mock API call
  const mockMatches = [
    { id: '1', name: 'Margaret Smith', age: 72, photo: 'https://example.com/margaret.jpg', interests: ['cooking', 'gardening', 'reading'], distance: 5.2, compatibilityScore: 85 },
    { id: '2', name: 'Sarah Johnson', age: 28, photo: 'https://example.com/sarah.jpg', interests: ['reading', 'hiking', 'photography'], distance: 3.1, compatibilityScore: 78 },
    { id: '3', name: 'David Lee', age: 65, photo: 'https://example.com/david.jpg', interests: ['cooking', 'gardening', 'fishing'], distance: 7.4, compatibilityScore: 82 },
  ];
  return mockMatches;
};

export const fetchConnections = async (userId) => {
  // Mock API call
  const mockConnections = [
    { id: 'conn1', userId: 'user1', matchId: 'user2', status: 'active', createdAt: Date.now() },
    { id: 'conn2', userId: 'user1', matchId: 'user3', status: 'active', createdAt: Date.now() },
  ];
  return mockConnections;
};

export const sendConnectionRequest = async (userId, matchId) => {
  // Mock API call
  return { success: true };
};

export const acceptConnectionRequest = async (connectionId) => {
  // Mock API call
  return { success: true };
};

export const fetchMessages = async (connectionId) => {
  // Mock API call
  const mockMessages = [
    { id: 'msg1', connectionId: 'conn1', senderId: 'user1', text: 'Hello!', createdAt: Date.now() },
    { id: 'msg2', connectionId: 'conn1', senderId: 'user2', text: 'Hi there!', createdAt: Date.now() },
  ];
  return mockMessages;
};

export const sendMessage = async (connectionId, senderId, text) => {
  // Mock API call
  return { success: true };
};

export const fetchCheckIns = async (connectionId) => {
  // Mock API call
  const mockCheckIns = [
    { id: 'check1', connectionId: 'conn1', scheduledAt: Date.now() + 86400000, completedAt: null },
    { id: 'check2', connectionId: 'conn1', scheduledAt: Date.now() + 172800000, completedAt: null },
  ];
  return mockCheckIns;
};

export const markCheckInComplete = async (checkInId) => {
  // Mock API call
  return { success: true };
};
