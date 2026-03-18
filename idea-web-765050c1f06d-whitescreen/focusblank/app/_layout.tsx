import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initializeApp } from '../utils/initializeApp';

const Layout = () => {
  useEffect(() => {
    initializeApp();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="modes"
          options={{
            title: 'Modes',
          }}
        />
        <Tabs.Screen
          name="widgets"
          options={{
            title: 'Widgets',
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
};

export default Layout;
