import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

interface AICoachMessageProps {
  message: string;
  isLoading?: boolean;
  timestamp?: string;
}

const AICoachMessage: React.FC<AICoachMessageProps> = ({ message, isLoading = false, timestamp }) => {
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (message && !isLoading) {
      setIsTyping(true);
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < message.length) {
          setDisplayedMessage(message.substring(0, i + 1));
          i++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, 20);

      return () => clearInterval(typingInterval);
    }
  }, [message, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons name="robot-happy" size={24} color={Colors.light.tint} />
        </View>
        <View style={styles.messageContainer}>
          <ActivityIndicator size="small" color={Colors.light.tint} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <MaterialCommunityIcons name="robot-happy" size={24} color={Colors.light.tint} />
      </View>
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          {displayedMessage}
          {isTyping && <Text style={styles.cursor}>|</Text>}
        </Text>
        {timestamp && (
          <Text style={styles.timestamp}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 8,
    marginHorizontal: 16,
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  messageContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 12,
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: Colors.light.text,
  },
  cursor: {
    color: Colors.light.tint,
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 4,
    textAlign: 'right',
  },
});

export default AICoachMessage;
