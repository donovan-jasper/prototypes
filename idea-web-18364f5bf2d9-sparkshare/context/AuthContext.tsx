import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '../lib/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const userData = await SecureStore.getItemAsync('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  const login = async (email: string, password: string) => {
    // In a real app, you would call your authentication API here
    // For this prototype, we'll use mock data
    const mockUser: User = {
      id: 1,
      username: 'testuser',
      email,
      location: 'San Francisco',
      created_at: new Date().toISOString(),
    };

    await SecureStore.setItemAsync('user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('user');
    setUser(null);
  };

  const register = async (username: string, email: string, password: string) => {
    // In a real app, you would call your registration API here
    // For this prototype, we'll use mock data
    const mockUser: User = {
      id: Math.floor(Math.random() * 1000),
      username,
      email,
      location: 'New York', // Default location
      created_at: new Date().toISOString(),
    };

    await SecureStore.setItemAsync('user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
