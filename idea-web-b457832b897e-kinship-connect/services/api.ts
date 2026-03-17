const API_BASE_URL = 'https://api.bridgegen.com';

export const fetchMatches = async (userId) => {
  // Mock API call
  const mockMatches = [
    { id: '1', name: 'Margaret Smith', age: 72, photo: 'https://example.com/margaret.jpg', interests: ['cooking', 'gardening', 'reading'], lat: 40.7128, lon: -74.0060, distance: 5.2, compatibilityScore: 85 },
    { id: '2', name: 'Sarah Johnson', age: 28, photo: 'https://example.com/sarah.jpg', interests: ['reading', 'hiking', 'photography'], lat: 40.7580, lon: -73.9855, distance: 3.1, compatibilityScore: 78 },
    { id: '3', name: 'David Lee', age: 65, photo: 'https://example.com/david.jpg', interests: ['cooking', 'gardening', 'fishing'], lat: 40.7200, lon: -74.0100, distance: 7.4, compatibilityScore: 82 },
  ];
  return mockMatches;
};

export const fetchConnections = async (userId) => {
  // Mock API call with last message data
  const mockConnections = [
    { 
      id: 'conn1', 
      userId: 'user1', 
      matchId: 'user2',
      matchName: 'Margaret Smith',
      matchPhoto: 'https://example.com/margaret.jpg',
      lastMessage: 'That recipe sounds wonderful! I can\'t wait to try it.',
      lastMessageTime: Date.now() - 3600000, // 1 hour ago
      unreadCount: 2,
      status: 'active', 
      createdAt: Date.now() 
    },
    { 
      id: 'conn2', 
      userId: 'user1', 
      matchId: 'user3',
      matchName: 'David Lee',
      matchPhoto: 'https://example.com/david.jpg',
      lastMessage: 'See you at the community garden tomorrow!',
      lastMessageTime: Date.now() - 86400000, // 1 day ago
      unreadCount: 0,
      status: 'active', 
      createdAt: Date.now() 
    },
    { 
      id: 'conn3', 
      userId: 'user1', 
      matchId: 'user4',
      matchName: 'Sarah Johnson',
      matchPhoto: 'https://example.com/sarah.jpg',
      lastMessage: 'Thanks for the book recommendation!',
      lastMessageTime: Date.now() - 172800000, // 2 days ago
      unreadCount: 1,
      status: 'active', 
      createdAt: Date.now() 
    },
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
