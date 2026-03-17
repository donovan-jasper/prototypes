import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import { TaskProvider } from './src/context/TaskContext';
import { DatabaseService } from './src/services/DatabaseService';
import { NotificationService } from './src/services/NotificationService';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await DatabaseService.initialize();
        await NotificationService.initialize();
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();

    return () => {
      NotificationService.cleanup();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <TaskProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Premium" component={PremiumScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </TaskProvider>
    </SafeAreaProvider>
  );
}
