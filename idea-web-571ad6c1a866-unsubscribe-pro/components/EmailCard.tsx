import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { classifyEmail, getAITags } from '../lib/subscription-detector';
import { useUnsubscribe } from '../hooks/useUnsubscribe';
import { Email } from '../types';

interface EmailCardProps {
  email: Email;
  onUnsubscribe: (emailId: string) => void;
}

const EmailCard: React.FC<EmailCardProps> = ({ email, onUnsubscribe }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [classification, setClassification] = useState<'important' | 'promotional' | 'spam' | 'subscription'>('promotional');
  const [tags, setTags] = useState<string[]>([]);
  const { unsubscribe } = useUnsubscribe();

  React.useEffect(() => {
    const classify = async () => {
      const result = await classifyEmail(email);
      setClassification(result);
      const emailTags = await getAITags(email);
      setTags(emailTags);
    };
    classify();
  }, [email]);

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      await unsubscribe(email);
      onUnsubscribe(email.id);
    } catch (error) {
      console.error('Unsubscribe failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRightActions = () => (
    <View style={styles.rightActions}>
      <TouchableOpacity
        style={[styles.actionButton, styles.unsubscribeButton]}
        onPress={handleUnsubscribe}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <MaterialIcons name="delete" size={24} color="white" />
            <Text style={styles.actionText}>Unsubscribe</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const getClassificationColor = () => {
    switch (classification) {
      case 'important':
        return '#4CAF50'; // Green
      case 'promotional':
        return '#2196F3'; // Blue
      case 'spam':
        return '#F44336'; // Red
      case 'subscription':
        return '#9C27B0'; // Purple
      default:
        return '#757575'; // Gray
    }
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={styles.card}>
        <View style={[styles.classificationIndicator, { backgroundColor: getClassificationColor() }]} />
        <View style={styles.content}>
          <Text style={styles.sender} numberOfLines={1}>{email.from}</Text>
          <Text style={styles.subject} numberOfLines={1}>{email.subject}</Text>
          <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.date}>{new Date(email.date).toLocaleDateString()}</Text>
        </View>
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  classificationIndicator: {
    width: 6,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sender: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subject: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingLeft: 16,
  },
  actionButton: {
    width: 120,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginLeft: 8,
  },
  unsubscribeButton: {
    backgroundColor: '#F44336',
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
});

export default EmailCard;
