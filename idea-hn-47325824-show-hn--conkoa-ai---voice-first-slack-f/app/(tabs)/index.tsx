import { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, Alert, TouchableOpacity } from 'react-native';
import { useMessageStore } from '../../store/messages';
import { useTaskStore } from '../../store/tasks';
import { useUserStore } from '../../store/user'; // Import useUserStore
import { getMessages, saveMessage, saveTask, getPendingMessagesCount, db, getTasks, updateMessageText } from '../../lib/db';
import VoiceButton from '../../components/VoiceButton';
import MessageBubble from '../../components/MessageBubble';
import NetInfo from '@react-native-community/netinfo';
import { queueOfflineMessage, syncPendingMessages, checkForConflicts } from '../../lib/sync';
import { Message, Task, ParsedCommand } from '../../types';
import { parseVoiceCommand, generateResponse } from '../../lib/ai';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import * as Speech from 'expo-speech';

export default function MessagesScreen() {
  const { messages, setMessages, addMessage, updateMessage } = useMessageStore();
  const { tasks, setTasks, addTask } = useTaskStore();
  const { userId: currentUserId } = useUserStore(); // Get dynamic userId
  const [channelId] = useState('default');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isConnected, setIsConnected] = useState(true);

  const loadMessages = useCallback(async () => {
    console.log('Loading messages from DB...');
    const msgs = await getMessages(channelId);
    setMessages(msgs);
    console.log(`Loaded ${msgs.length} messages.`);
  }, [channelId, setMessages]);

  const loadTasks = useCallback(async () => {
    console.log('Loading tasks from DB...');
    const loadedTasks = await getTasks();
    setTasks(loadedTasks);
    console.log(`Loaded ${loadedTasks.length} tasks.`);
  }, [setTasks]);

  const updatePendingCount = useCallback(async () => {
    const count = await getPendingMessagesCount();
    setPendingCount(count);
  }, []);

  useEffect(() => {
    loadMessages();
    loadTasks();
    updatePendingCount();

    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      console.log('Network state changed:', state.isConnected);

      if (state.isConnected && !isSyncing) {
        console.log('Network reconnected, attempting to sync pending messages...');
        setIsSyncing(true);
        syncPendingMessages()
          .then(syncedCount => {
            if (syncedCount > 0) {
              console.log(`Synced ${syncedCount} pending messages.`);
              loadMessages(); // Refresh messages to show updated sync status
              updatePendingCount();
            }
          })
          .catch(err => console.error('Error during sync:', err))
          .finally(() => setIsSyncing(false));
      }
    });

    // Periodic sync check
    const syncInterval = setInterval(() => {
      if (isConnected && !isSyncing) {
        console.log('Performing periodic sync check...');
        setIsSyncing(true); // Prevent multiple syncs if one is already running
        syncPendingMessages()
          .then(syncedCount => {
            if (syncedCount > 0) {
              console.log(`Periodic sync: Synced ${syncedCount} pending messages.`);
              loadMessages(); // Refresh messages to show updated sync status
              updatePendingCount();
            }
          })
          .catch(err => console.error('Error during periodic sync:', err))
          .finally(() => setIsSyncing(false));
      }
    }, 30000); // Check every 30 seconds

    return () => {
      unsubscribeNetInfo();
      clearInterval(syncInterval);
    };
  }, [loadMessages, loadTasks, isSyncing, isConnected, updatePendingCount]);

  const addAiResponseMessage = async (text: string) => {
    const aiMessage: Message = {
      id: uuidv4(),
      channelId,
      userId: 'AI-Assistant',
      text,
      timestamp: Date.now(),
      synced: true, // AI messages are considered immediately synced
      version: 1,
    };
    await saveMessage(aiMessage, true);
    addMessage(aiMessage);
    Speech.speak(text); // Speak the AI response
  };

  async function handleTranscript(text: string, audioUri?: string) {
    setIsProcessingCommand(true);

    const messageId = uuidv4();
    let message: Message = {
      id: messageId,
      channelId,
      userId: currentUserId || 'unknown-user', // Use dynamic userId
      text,
      audioUrl: audioUri,
      timestamp: Date.now(),
      synced: false, // Assume false initially, update based on network/API
      version: 1,
    };

    // Add to UI immediately (with initial synced status)
    addMessage(message);

    let successfullySentOnline = false;
    if (isConnected) {
      try {
        console.log(`Attempting to send message ${message.id} to backend...`);
        const response = await fetch('https://api.voxcrew.com/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        });

        if (response.ok) {
          console.log(`Message ${message.id} sent successfully to backend.`);
          message.synced = true;
          successfullySentOnline = true;
        } else {
          console.warn(`Failed to send message ${message.id} to backend (status: ${response.status}). Queuing for offline sync.`);
          // Even if online, if API fails, queue it
          await queueOfflineMessage(message);
          message.synced = false;
        }
      } catch (error) {
        console.error(`Network error sending message ${message.id}:`, error);
        // Network error while online, queue it
        await queueOfflineMessage(message);
        message.synced = false;
      }
    } else {
      console.log(`Offline. Queuing message ${message.id} for later sync.`);
      await queueOfflineMessage(message);
      message.synced = false;
    }

    // Update local DB with final synced status
    await saveMessage(message, message.synced);
    // Update Zustand store with final synced status (if it changed from initial add)
    updateMessage(message.id, { synced: message.synced });
    updatePendingCount(); // Update pending count if message was queued

    if (!successfullySentOnline) {
      // If message was not successfully sent online (either offline or online-but-failed-API),
      // provide an AI response indicating the status.
      const aiResponseText = isConnected
        ? "Couldn't send your message right now, but I've queued it for when the connection is stable."
        : "You're offline. Your message will be sent when you reconnect.";
      await addAiResponseMessage(aiResponseText);
      setIsProcessingCommand(false);
      return;
    }

    // --- AI processing logic (only if successfullySentOnline is true) ---
    try {
      console.log('Parsing voice command with AI:', text);
      const parsedCommand: ParsedCommand = await parseVoiceCommand(text);

      if (parsedCommand.type === 'task') {
        const taskId = uuidv4();
        const newTask: Task = {
          id: taskId,
          title: parsedCommand.content,
          description: parsedCommand.details,
          dueDate: parsedCommand.dueDate ? new Date(parsedCommand.dueDate).getTime() : null,
          completed: false,
          createdAt: Date.now(),
          version: 1,
        };
        await saveTask(newTask);
        addTask(newTask);
        await addAiResponseMessage(`Task "${newTask.title}" added to your list.`);
      } else if (parsedCommand.type === 'query') {
        const context = messages.slice(0, 5).map(m => `${m.userId}: ${m.text}`); // Last 5 messages as context
        const aiResponse = await generateResponse(parsedCommand.content, context);
        await addAiResponseMessage(aiResponse);
      } else if (parsedCommand.type === 'message' || parsedCommand.type === 'status_update') {
        // For simple messages or status updates, the initial message is already sent.
        // AI might provide a confirmation or additional info.
        await addAiResponseMessage(`Understood. Your message has been noted.`);
      } else {
        await addAiResponseMessage("I'm not sure how to handle that command. Can you try rephrasing?");
      }
    } catch (error) {
      console.error('Error during AI command parsing or response generation:', error);
      await addAiResponseMessage("I encountered an error trying to understand your command. Please try again.");
    } finally {
      setIsProcessingCommand(false);
    }
  }

  return (
    <View style={styles.container}>
      {isProcessingCommand && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.overlayText}>Processing command...</Text>
        </View>
      )}

      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline" size={20} color="white" />
          <Text style={styles.offlineText}>Offline. Messages will sync when connected.</Text>
          {pendingCount > 0 && (
            <Text style={styles.pendingCountText}>({pendingCount} pending)</Text>
          )}
        </View>
      )}

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} currentUserId={currentUserId} />}
        inverted
      />
      <VoiceButton onTranscript={handleTranscript} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  overlayText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff9500',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  offlineText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  pendingCountText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 12,
  },
});
