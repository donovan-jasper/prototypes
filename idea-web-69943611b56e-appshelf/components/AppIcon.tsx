import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { launchApp } from '../lib/appManager';

interface AppIconProps {
  app: {
    packageName: string;
    label: string;
    icon?: string;
  };
  size?: number;
  onLongPress?: () => void;
}

const AppIcon: React.FC<AppIconProps> = ({ app, size = 64, onLongPress }) => {
  const handlePress = () => {
    launchApp(app.packageName);
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: size, height: size + 24 }]}
      onPress={handlePress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {app.icon ? (
        <Image
          source={{ uri: app.icon }}
          style={[styles.icon, { width: size, height: size }]}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.placeholderIcon, { width: size, height: size }]}>
          <Text style={styles.placeholderText}>{app.label.charAt(0)}</Text>
        </View>
      )}
      <Text style={styles.label} numberOfLines={1}>
        {app.label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
  },
  icon: {
    borderRadius: 12,
  },
  placeholderIcon: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 24,
    color: '#666',
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
});

export default AppIcon;
