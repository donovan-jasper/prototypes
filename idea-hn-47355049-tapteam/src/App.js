import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';

// Import screens
import HomeScreen from './screens/HomeScreen';
import ToolIntegrationScreen from './screens/ToolIntegrationScreen'; // New screen
// import other screens as they are created, e.g., TaskScreen, SessionHistoryScreen

// Import SQLite utility for initialization
import { initDb } from './utils/sqlite';

const Stack = createNativeStackNavigator();

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await initDb();
        setDbInitialized(true);
        console.log('Database initialized successfully.');
      } catch (error) {
        console.error('Failed to initialize database:', error);
        // Handle error, maybe show an error screen or retry option
      }
    };

    initializeDatabase();
  }, []);

  if (!dbInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Initializing database...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'RaccoonAI Home' }}
        />
        <Stack.Screen
          name="ToolIntegration"
          component={ToolIntegrationScreen}
          options={{ title: 'Tool Integrations' }}
        />
        {/* Add other screens here */}
        {/* <Stack.Screen name="Task" component={TaskScreen} /> */}
        {/* <Stack.Screen name="SessionHistory" component={SessionHistoryScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});
