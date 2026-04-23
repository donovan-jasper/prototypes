import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { handleCoachReply } from '../lib/ai-coach';

interface AICoachMessageProps {
  message: string;
  isUser?: boolean;
  streakContext?: {
    currentStreak: number;
    longestStreak: number;
    habitName: string;
    completionRate: number;
    status: 'active' | 'at-risk' | 'broken';
  };
  onReply?: (response: string) => void;
  userId?: string;
  habitId?: string;
}

const AICoachMessage: React.FC<AICoachMessageProps> = ({
  message,
  isUser = false,
  streakContext,
  onReply,
  userId,
  habitId
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [typingAnimation] = useState(new Animated.Value(0));
  const [showTyping, setShowTyping] = useState(true);
  const [showContext, setShowContext] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const { user } = useStore();

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
        setShowTyping(false);
      }
    }, 20);

    return () => clearInterval(typingInterval);
  }, [message]);

  const getStatusColor = () => {
    if (!streakContext) return '#6C63FF';
    switch (streakContext.status) {
      case 'active':
        return '#4CAF50'; // Green for good progress
      case 'at-risk':
        return '#FF9800'; // Orange for warning
      case 'broken':
        return '#F44336'; // Red for broken streak
      default:
        return '#6C63FF';
    }
  };

  const handleReply = async (response: string) => {
    if (!userId || !habitId) return;

    setIsReplying(true);
    try {
      const replyMessage = await handleCoachReply(userId, habitId, response);
      if (onReply) {
        onReply(replyMessage);
      }
    } catch (error) {
      console.error('Error handling reply:', error);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.coachContainer]}>
      {!isUser && (
        <View style={[styles.avatarContainer, { backgroundColor: getStatusColor() }]}>
          <MaterialCommunityIcons name="robot-happy" size={24} color="#fff" />
        </View>
      )}
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.coachBubble]}>
        <Text style={styles.messageText}>{displayedText}</Text>
        {showTyping && (
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
        )}
        {streakContext && (
          <TouchableOpacity
            style={styles.contextToggle}
            onPress={() => setShowContext(!showContext)}
          >
            <Text style={styles.contextToggleText}>
              {showContext ? 'Hide Details' : 'Show Streak Details'}
            </Text>
          </TouchableOpacity>
        )}
        {streakContext && showContext && (
          <View style={styles.streakContextContainer}>
            <Text style={styles.contextText}>
              {`${streakContext.habitName} streak: ${streakContext.currentStreak} days`}
            </Text>
            <Text style={styles.contextText}>
              {`Longest: ${streakContext.longestStreak} days`}
            </Text>
            <Text style={styles.contextText}>
              {`Completion: ${streakContext.completionRate.toFixed(0)}%`}
            </Text>
          </View>
        )}
        {!isUser && !isReplying && (
          <View style={styles.replyButtons}>
            <TouchableOpacity
              style={styles.replyButton}
              onPress={() => handleReply('Thanks!')}
            >
              <Text style={styles.replyButtonText}>Thanks!</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.replyButton}
              onPress={() => handleReply('What should I do next?')}
            >
              <Text style={styles.replyButtonText}>Next steps</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.replyButton}
              onPress={() => handleReply('I need help with this')}
            >
              <Text style={styles.replyButtonText}>Need help</Text>
            </TouchableOpacity>
          </View>
        )}
        {isReplying && (
          <View style={styles.replyIndicator}>
            <ActivityIndicator size="small" color="#6C63FF" />
            <Text style={styles.replyText}>Coach is thinking...</Text>
          </View>
        )}
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
    backgroundColor: '#f0f0f0',
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
  contextToggle: {
    marginTop: 8,
    paddingVertical: 4,
  },
  contextToggleText: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '500',
  },
  streakContextContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#e6e6e6',
    borderRadius: 8,
  },
  contextText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  replyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  replyButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  replyButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  replyText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});

export default AICoachMessage;
