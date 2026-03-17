import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AICoachMessageProps {
  message: string;
  isUser: boolean;
}

const AICoachMessage: React.FC<AICoachMessageProps> = ({ message, isUser }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [typingAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    // Typing animation
    Animated.timing(typingAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Text reveal animation
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < message.length) {
        setDisplayedText(message.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 20);

    return () => clearInterval(typingInterval);
  }, [message]);

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.coachContainer]}>
      {!isUser && (
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons name="robot-happy" size={24} color="#fff" />
        </View>
      )}
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.coachBubble]}>
        <Text style={styles.messageText}>{displayedText}</Text>
        <Animated.View
          style={[
            styles.typingIndicator,
            {
              opacity: typingAnimation,
              transform: [
                {
                  translateX: typingAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.typingText}>...</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 16,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    marginRight: 8,
  },
  coachContainer: {
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '100%',
  },
  userBubble: {
    backgroundColor: '#6C63FF',
    borderBottomRightRadius: 4,
  },
  coachBubble: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  typingIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 8,
  },
  typingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default AICoachMessage;
