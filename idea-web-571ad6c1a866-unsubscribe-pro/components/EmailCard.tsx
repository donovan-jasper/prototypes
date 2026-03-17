import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useUnsubscribe } from '../hooks/useUnsubscribe';
import { Sender } from '../types';

interface EmailCardProps {
  sender: Sender;
  isPro: boolean;
}

export default function EmailCard({ sender, isPro }: EmailCardProps) {
  const { unsubscribe, isLoading } = useUnsubscribe();

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.swipeAction}
      onPress={() => unsubscribe(sender.id)}
      disabled={isLoading}
    >
      <Text style={styles.swipeText}>Unsubscribe</Text>
    </TouchableOpacity>
  );

  const getCategoryColor = () => {
    switch (sender.category) {
      case 'important':
        return '#4CAF50';
      case 'promotional':
        return '#FF9800';
      case 'spam':
        return '#F44336';
      case 'subscription':
        return '#9C27B0';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      containerStyle={styles.container}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor() }]} />
          <Text style={styles.senderName}>{sender.name}</Text>
        </View>
        <Text style={styles.emailCount}>{sender.emailCount} emails in last 30 days</Text>
        {isPro && (
          <View style={styles.aiTags}>
            {sender.tags?.map((tag) => (
              <Text key={tag} style={[
                styles.tag,
                tag === 'subscription' && styles.subscriptionTag
              ]}>
                {tag}
              </Text>
            ))}
          </View>
        )}
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  categoryBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  senderName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emailCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  aiTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  tag: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: 12,
    marginRight: 5,
    marginBottom: 5,
  },
  subscriptionTag: {
    backgroundColor: '#E1BEE7',
    color: '#4A148C',
  },
  swipeAction: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
    borderRadius: 8,
  },
  swipeText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
