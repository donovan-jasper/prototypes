import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { initializeApp } from '../utils/initializeApp';

const Layout = () => {
  useEffect(() => {
    initializeApp();
  }, []);

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
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
  );
};

export default Layout;
