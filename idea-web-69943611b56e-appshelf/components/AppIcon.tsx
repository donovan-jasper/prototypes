import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { launchApp } from '../lib/appManager';

interface AppIconProps {
  packageName: string;
  label: string;
  icon?: string;
  onLongPress?: () => void;
}

const AppIcon: React.FC<AppIconProps> = ({ packageName, label, icon, onLongPress }) => {
  const handlePress = async () => {
    try {
      await launchApp(packageName);
    } catch (error) {
      console.error('Failed to launch app:', error);
      // Show error message to user
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {icon ? (
          <Image
            source={{ uri: icon }}
            style={styles.icon}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderIcon}>
            <Text style={styles.placeholderText}>{label.charAt(0)}</Text>
          </View>
        )}
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    margin: 8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  icon: {
    width: 40,
    height: 40,
  },
  placeholderIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  label: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    width: '100%',
  },
});

export default AppIcon;
