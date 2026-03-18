import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InstallTracker from './components/InstallTracker';
import DeepLinkManager from './components/DeepLinkManager';
import Analytics from './components/Analytics';
import { initializeDatabase } from './services/DatabaseService';

const Stack = createNativeStackNavigator();

function App() {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initializeDatabase();
        setIsDbReady(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    setupDatabase();
  }, []);

  if (!isDbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="InstallTracker" component={InstallTracker} />
        <Stack.Screen name="DeepLinkManager" component={DeepLinkManager} />
        <Stack.Screen name="Analytics" component={Analytics} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
