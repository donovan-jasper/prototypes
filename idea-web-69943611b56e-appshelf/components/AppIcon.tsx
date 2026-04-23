import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import * as Linking from 'expo-linking';

interface AppIconProps {
  app: {
    packageName: string;
    label: string;
    icon?: string;
  };
  onPress?: () => void;
  onLongPress?: () => void;
}

export const AppIcon: React.FC<AppIconProps> = ({ app, onPress, onLongPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    try {
      if (Platform.OS === 'android') {
        Linking.openURL(`intent:#Intent;package=${app.packageName};end`);
      } else {
        // For iOS, use URL scheme
        Linking.openURL(app.packageName);
      }
    } catch (error) {
      console.error('Error launching app:', error);
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
        {app.icon ? (
          <Image
            source={{ uri: app.icon }}
            style={styles.icon}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderIcon}>
            <Text style={styles.placeholderText}>
              {app.label.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {app.label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 80,
    margin: 8,
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  placeholderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
});
