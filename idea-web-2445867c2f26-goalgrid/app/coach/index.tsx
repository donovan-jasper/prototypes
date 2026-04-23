import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AICoachMessage from '../../components/AICoachMessage';
import Colors from '../../constants/Colors';
import { fetchCoachMessages, generateCoachMessage } from '../../lib/ai-coach';
import { fetchCoachContext } from '../../lib/ai-coach';
import { useStore } from '../../store/useStore';

interface CoachMessage {
  id: string;
  message: string;
  timestamp: string;
  habitId: string;
}

const CoachScreen = () => {
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { userId, habits } = useStore();

  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedMessages = await fetchCoachMessages(userId);
      setMessages(fetchedMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error('Error loading coach messages:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId]);

  const generateNewMessage = useCallback(async () => {
    if (habits.length === 0 || isGenerating) return;

    try {
      setIsGenerating(true);
      // Use the first habit for demonstration - in a real app you might want to select one
      const habitId = habits[0].id;
      const context = await fetchCoachContext(userId, habitId);
      const newMessage = await generateCoachMessage(context);

      // Add the new message to the list
      const messageWithId = {
        id: Date.now().toString(),
        message: newMessage,
        timestamp: new Date().toISOString(),
        habitId: habitId
      };

      setMessages(prev => [messageWithId, ...prev]);
    } catch (error) {
      console.error('Error generating new message:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [userId, habits, isGenerating]);

  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [loadMessages])
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadMessages();
  }, [loadMessages]);

  if (isLoading && messages.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AICoachMessage
            message={item.message}
            timestamp={item.timestamp}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.tint}
          />
        }
        ListHeaderComponent={
          habits.length > 0 ? (
            <View style={styles.generateButtonContainer}>
              <MaterialCommunityIcons.Button
                name="refresh"
                backgroundColor={Colors.light.tint}
                onPress={generateNewMessage}
                disabled={isGenerating}
              >
                Generate New Message
              </MaterialCommunityIcons.Button>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="robot-happy" size={48} color={Colors.light.tint} />
            <Text style={styles.emptyText}>No messages yet. Create a habit to get started!</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  listContent: {
    paddingBottom: 20,
  },
  generateButtonContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
  },
});

export default CoachScreen;
