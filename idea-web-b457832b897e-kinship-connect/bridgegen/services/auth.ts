import * as SecureStore from 'expo-secure-store';
import { saveUser, getUser } from './database';

export const login = async (email, password) => {
  // Mock authentication
  const mockUser = {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password',
    age: 30,
    photo: 'https://example.com/john.jpg',
    bio: 'I am a software developer and love to cook.',
    interests: ['cooking', 'programming', 'hiking'],
    lat: 40.7128,
    lon: -74.0060,
  };

  if (email === mockUser.email && password === mockUser.password) {
    await SecureStore.setItemAsync('token', 'mock-jwt-token');
    await saveUser(mockUser);
    return mockUser;
  } else {
    throw new Error('Invalid email or password');
  }
};

export const signup = async (userData) => {
  // Mock user creation
  const newUser = {
    id: 'user' + Date.now(),
    ...userData,
    photo: 'https://example.com/default.jpg',
    bio: '',
    interests: [],
    lat: 0,
    lon: 0,
  };

  await SecureStore.setItemAsync('token', 'mock-jwt-token');
  await saveUser(newUser);
  return newUser;
};

export const logout = async () => {
  await SecureStore.deleteItemAsync('token');
};

export const getCurrentUser = async () => {
  const token = await SecureStore.getItemAsync('token');
  if (!token) return null;

  // Mock token validation
  const userId = 'user1';
  const user = await getUser(userId);
  return user;
};
