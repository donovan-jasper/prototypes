import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { CalendarProvider } from './src/contexts/CalendarContext';
import { initializeDatabase } from './src/services/data/database';

export default function App() {
  // Initialize database on app start
  initializeDatabase();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <AuthProvider>
        <SettingsProvider>
          <CalendarProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </CalendarProvider>
        </SettingsProvider>
      </AuthProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});
