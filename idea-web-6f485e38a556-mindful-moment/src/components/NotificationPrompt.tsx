import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface NotificationPromptProps {
  onRequestPermission: () => void;
}

export const NotificationPrompt: React.FC<NotificationPromptProps> = ({ onRequestPermission }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enable Notifications</Text>
      <Text style={styles.description}>
        FlowBreak works best with notifications. We'll gently remind you when you need a moment.
      </Text>
      <TouchableOpacity style={styles.button} onPress={onRequestPermission}>
        <Text style={styles.buttonText}>Allow Notifications</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
