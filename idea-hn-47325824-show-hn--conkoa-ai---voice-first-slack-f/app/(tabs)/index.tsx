import { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, Alert, TouchableOpacity } from 'react-native';
import { useMessageStore } from '../../store/messages';
import { useTaskStore } from '../../store/tasks';
import { useUserStore } from '../../store/user';
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
  const { userId } = useUserStore(); // Get userId from store
  const currentUserId = userId || 'unknown-user'; // Ensure it's always a string
  const [channelId] = useState('default');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isConnected, setIsConnected] = useState(true);
  const [showSyncToast, setShowSyncToast] = useState(false);
  const [syncToastMessage, setSyncToastMessage] = useState('');

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

  const showToast = (message: string) => {
    setSyncToastMessage(message);
    setShowSyncToast(true);
    setTimeout(() => setShowSyncToast(false), 3000); // Hide after 3 seconds
  };

  const handleManualSync = useCallback(async () => {
    if (isSyncing) return; // Prevent multiple syncs

    setIsSyncing(true);
    try {
      const syncedCount = await syncPendingMessages();
      if (syncedCount > 0) {
        showToast(`Synced ${syncedCount} pending messages!`);
        // After sync, update the UI for messages that are now synced
        // Fetch all pending messages again to see what's left
        const remainingPending = await db.getAllAsync('SELECT id FROM pending_messages');
        const remainingPendingIds = new Set(remainingPending.map((item: any) => item.id));

        // Update messages in Zustand that are no longer pending
        messages.forEach(msg => {
          if (!msg.synced && !remainingPendingIds.has(msg.id)) {
            updateMessage(msg.id, { synced: true });
          }
        });
        updatePendingCount(); // Refresh pending count
      } else {
        showToast('No pending messages to sync.');
      }
    } catch (err) {
      console.error('Error during manual sync:', err);
      showToast('Sync failed. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, messages, updateMessage, updatePendingCount]);


  useEffect(() => {
    loadMessages();
    loadTasks();
    updatePendingCount();

    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      console.log('Network state changed:', state.isConnected);

      if (state.isConnected && !isSyncing) {
        console.log('Network reconnected, attempting to sync pending messages...');
        handleManualSync(); // Use the same handler for automatic sync
      }
    });

    // Periodic sync check
    const syncInterval = setInterval(() => {
      if (isConnected && !isSyncing) {
        console.log('Performing periodic sync check...');
        handleManualSync(); // Use the same handler for periodic sync
      }
    }, 30000); // Check every 30 seconds

    return () => {
      unsubscribeNetInfo();
      clearInterval(syncInterval);
    };
  }, [loadMessages, loadTasks, isSyncing, isConnected, updatePendingCount, handleManualSync]);


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
      userId: currentUserId,
      text,
      audioUrl: audioUri,
      timestamp: Date.now(),
      synced: false, // Initially assume not synced
      version: 1,
    };

    // Add to UI immediately
    addMessage(message);

    let successfullySentOnline = false;
    if (isConnected) {
      try {
        console.log(`Attempting to send message ${message.id} to backend.`);
        const response = await fetch('https://api.voxcrew.com/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        });

        if (response.ok) {
          successfullySentOnline = true;
          message.synced = true; // Mark as synced if sent immediately
          await saveMessage(message, true); // Save to DB as synced
          updateMessage(message.id, { synced: true }); // Update Zustand
          console.log(`Message ${message.id} sent to backend and marked as synced.`);
        } else {
          console.warn(`Failed to send message ${message.id} to backend immediately (status: ${response.status}). Queueing for offline sync.`);
          await saveMessage(message, false); // Save to DB as not synced
          await queueOfflineMessage(message);
          updatePendingCount();
        }
      } catch (networkError) {
        console.error(`Network error sending message ${message.id} immediately:`, networkError);
        await saveMessage(message, false); // Save to DB as not synced
        await queueOfflineMessage(message);
        updatePendingCount();
      }
    } else {
      console.log(`Offline. Queueing message ${message.id} for offline sync.`);
      await saveMessage(message, false); // Save to DB as not synced
      await queueOfflineMessage(message);
      updatePendingCount();
    }

    // AI processing logic
    try {
      const parsedCommand: ParsedCommand = await parseVoiceCommand(text);
      console.log('Parsed command:', parsedCommand);

      if (parsedCommand.type === 'task' && parsedCommand.action === 'create') {
        const newTask: Task = {
          id: uuidv4(),
          title: parsedCommand.content || text,
          description: parsedCommand.content,
          dueDate: Date.now() + 24 * 60 * 60 * 1000, // Example: due tomorrow
          completed: false,
          createdAt: Date.now(),
        };
        await saveTask(newTask);
        addTask(newTask);
        addAiResponseMessage(`Task "${newTask.title}" added.`);
      } else if (parsedCommand.type === 'query') {
        const context = messages.slice(0, 5).map(m => m.text); // Last 5 messages as context
        const aiResponse = await generateResponse(parsedCommand.content || text, context);
        addAiResponseMessage(aiResponse);
      } else {
        // Default to message if no specific intent or if message intent
        // The message is already added to UI and handled for sync above
        // No further AI action needed for simple messages here
      }
    } catch (aiError) {
      console.error('AI processing failed:', aiError);
      addAiResponseMessage('Sorry, I had trouble processing that command.');
    } finally {
      setIsProcessingCommand(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Manual Sync Button */}
      <TouchableOpacity
        style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
        onPress={handleManualSync}
        disabled={isSyncing}
      >
        {isSyncing ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.syncButtonText}>
            {pendingCount > 0 ? `Sync Now (${pendingCount} pending)` : 'Sync Now'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Sync Toast Notification */}
      {showSyncToast && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{syncToastMessage}</Text>
        </View>
      )}

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            currentUserId={currentUserId}
            // onConflictResolve={() => handleConflictResolve(item.id)} // If conflict resolution is implemented
          />
        )}
        inverted
      />
      <VoiceButton onTranscript={handleTranscript} />
      {isProcessingCommand && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.processingText}>Processing voice command...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  syncButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  syncButtonDisabled: {
    backgroundColor: '#a0c8f0',
  },
  syncButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  toastContainer: {
    position: 'absolute',
    top: 60, // Adjust as needed to not overlap header
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    zIndex: 1000,
  },
  toastText: {
    color: 'white',
    fontSize: 14,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  processingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});
