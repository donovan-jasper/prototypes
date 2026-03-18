import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  name: string;
  hobbies: string[];
}

interface UserContextType {
  currentUser: UserProfile | null;
  saveUserProfile: (profile: UserProfile) => Promise<void>;
  loadUserProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@bondly_user_profile';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const loadUserProfile = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (storedProfile) {
        setCurrentUser(JSON.parse(storedProfile));
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const saveUserProfile = async (profile: UserProfile) => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
      setCurrentUser(profile);
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, saveUserProfile, loadUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
