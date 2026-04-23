import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Linking } from 'react-native';
import { useAppStore } from '../store/appStore';

interface AppIconProps {
  app: {
    packageName: string;
    label: string;
    icon?: string;
  };
  size?: number;
  onLongPress?: () => void;
}

const AppIcon: React.FC<AppIconProps> = ({ app, size = 60, onLongPress }) => {
  const navigation = useNavigation();
  const { activeMode } = useAppStore();

  const handlePress = async () => {
    try {
      if (Platform.OS === 'android') {
        // For Android, use package name to launch app
        await Linking.openURL(`intent://${app.packageName}#Intent;package=${app.packageName};end`);
      } else {
        // For iOS, use URL scheme
        await Linking.openURL(app.packageName);
      }
    } catch (error) {
      console.error('Error launching app:', error);
      // Fallback to app store if app isn't installed
      if (Platform.OS === 'android') {
        Linking.openURL(`market://details?id=${app.packageName}`);
      } else {
        Linking.openURL(`itms-apps://itunes.apple.com/app/id${app.packageName}`);
      }
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: size, height: size }]}
      onPress={handlePress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { width: size * 0.7, height: size * 0.7 }]}>
        {app.icon ? (
          <Image
            source={{ uri: app.icon }}
            style={styles.icon}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderIcon}>
            <Text style={styles.placeholderText}>{app.label.charAt(0)}</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginBottom: 4,
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  placeholderIcon: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
});

export default AppIcon;
