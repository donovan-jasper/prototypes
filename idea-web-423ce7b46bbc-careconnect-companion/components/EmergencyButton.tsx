import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSettings } from '../contexts/SettingsContext';

interface EmergencyButtonProps {
  onPress: () => void;
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({ onPress }) => {
  const { theme } = useSettings();

  const getStyles = () => {
    switch (theme) {
      case 'dark':
        return {
          button: styles.darkButton,
          text: styles.darkText,
          icon: styles.darkIcon,
        };
      case 'high-contrast':
        return {
          button: styles.highContrastButton,
          text: styles.highContrastText,
          icon: styles.highContrastIcon,
        };
      default: // light theme
        return {
          button: styles.lightButton,
          text: styles.lightText,
          icon: styles.lightIcon,
        };
    }
  };

  const currentStyles = getStyles();

  return (
    <TouchableOpacity
      style={[styles.button, currentStyles.button]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Emergency button"
      accessibilityHint="Double tap to activate emergency mode"
    >
      <View style={styles.content}>
        <MaterialIcons
          name="warning"
          size={48}
          style={[styles.icon, currentStyles.icon]}
        />
        <Text style={[styles.text, currentStyles.text]}>EMERGENCY</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    padding: 20,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  lightButton: {
    backgroundColor: '#ff0000',
  },
  darkButton: {
    backgroundColor: '#ff3333',
  },
  highContrastButton: {
    backgroundColor: '#ff0000',
    borderWidth: 3,
    borderColor: '#000000',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  lightText: {
    color: '#ffffff',
  },
  darkText: {
    color: '#ffffff',
  },
  highContrastText: {
    color: '#ffffff',
  },
  icon: {
    marginRight: 10,
  },
  lightIcon: {
    color: '#ffffff',
  },
  darkIcon: {
    color: '#ffffff',
  },
  highContrastIcon: {
    color: '#ffffff',
  },
});
