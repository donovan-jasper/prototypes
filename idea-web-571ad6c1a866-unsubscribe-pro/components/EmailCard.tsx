import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { Sender } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useEmailStore } from '../store/email-store';

interface EmailCardProps {
  sender: Sender;
  onUnsubscribe: () => void;
  onPress: () => void;
}

const EmailCard: React.FC<EmailCardProps> = ({ sender, onUnsubscribe, onPress }) => {
  const [swipeAnim] = useState(new Animated.Value(0));
  const [isSwiping, setIsSwiping] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const { markEmailAsProcessed } = useEmailStore();

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx > 0) {
        swipeAnim.setValue(gestureState.dx);
        setIsSwiping(true);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 150) {
        // Swipe completed
        Animated.timing(swipeAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          handleUnsubscribe();
        });
      } else {
        // Reset swipe
        Animated.spring(swipeAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start(() => {
          setIsSwiping(false);
        });
      }
    },
  });

  const handleUnsubscribe = async () => {
    setIsUnsubscribing(true);
    try {
      await onUnsubscribe();
      // Mark all emails from this sender as processed
      // In a real app, we would have a way to get all email IDs from this sender
      // For now, we'll just mark the sender as processed
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    } finally {
      setIsUnsubscribing(false);
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'important':
        return '#4CAF50'; // Green
      case 'promotional':
        return '#FF9800'; // Orange
      case 'spam':
        return '#F44336'; // Red
      case 'subscription':
        return '#9C27B0'; // Purple
      case 'transactional':
        return '#2196F3'; // Blue
      case 'newsletter':
        return '#00BCD4'; // Cyan
      case 'service-notification':
        return '#607D8B'; // Blue Grey
      default:
        return '#795548'; // Brown
    }
  };

  const getClassificationLabel = (classification: string) => {
    switch (classification) {
      case 'important':
        return 'Important';
      case 'promotional':
        return 'Promotional';
      case 'spam':
        return 'Spam';
      case 'subscription':
        return 'Subscription';
      case 'transactional':
        return 'Transactional';
      case 'newsletter':
        return 'Newsletter';
      case 'service-notification':
        return 'Service';
      default:
        return 'Other';
    }
  };

  const renderTags = () => {
    if (!sender.tags || sender.tags.length === 0) return null;

    return (
      <View style={styles.tagsContainer}>
        {sender.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              translateX: swipeAnim.interpolate({
                inputRange: [0, 300],
                outputRange: [0, 300],
                extrapolate: 'clamp',
              }),
            },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        disabled={isSwiping || isUnsubscribing}
      >
        <View style={styles.header}>
          <View style={styles.senderInfo}>
            <View style={[styles.classificationDot, { backgroundColor: getClassificationColor(sender.classification) }]} />
            <Text style={styles.senderName}>{sender.name}</Text>
          </View>
          <Text style={styles.emailCount}>{sender.emailCount} emails</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.classificationLabel}>{getClassificationLabel(sender.classification)}</Text>
          <Text style={styles.lastEmailDate}>
            Last email: {new Date(sender.lastEmailDate).toLocaleDateString()}
          </Text>
          {renderTags()}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.unsubscribeButton}
            onPress={handleUnsubscribe}
            disabled={isUnsubscribing}
          >
            {isUnsubscribing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="mail-unread-outline" size={16} color="white" />
                <Text style={styles.unsubscribeButtonText}>Unsubscribe</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <View style={styles.swipeAction}>
        <Ionicons name="checkmark-circle" size={24} color="white" />
        <Text style={styles.swipeActionText}>Unsubscribe</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classificationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  emailCount: {
    fontSize: 14,
    color: '#666',
  },
  body: {
    marginBottom: 12,
  },
  classificationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  lastEmailDate: {
    fontSize: 14,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#424242',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  unsubscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  unsubscribeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  swipeAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  swipeActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default EmailCard;
