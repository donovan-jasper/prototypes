import { Tabs } from 'expo-router';
import React from 'react';

const Layout = () => {
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
