import { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, Alert, TouchableOpacity } from 'react-native';
import { useMessageStore } from '../../store/messages';
import { useTaskStore } from '../../store/tasks';
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
              loadMessages();
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
        syncPendingMessages()
          .then(syncedCount => {
            if (syncedCount > 0) {
              loadMessages();
              updatePendingCount();
            }
          })
          .catch(err => console.error('Error during periodic sync:', err));
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

    // 1. Create and display the user's transcribed message (initially)
    const userMessageId = uuidv4(); // Generate ID once
    const userMessage: Message = {
      id: userMessageId,
      channelId,
      userId: 'current-user',
      text,
      audioUrl: audioUri,
      timestamp: Date.now(),
      synced: isConnected, // Will be updated if offline
      version: 1,
    };
    addMessage(userMessage); // Add to UI immediately
    await saveMessage(userMessage, isConnected); // Save to DB

    if (!isConnected) {
      console.log('Offline, queuing message for later sync.');
      await queueOfflineMessage(userMessage);
      updateMessage(userMessage.id, { synced: false }); // Mark as unsynced in UI
      await addAiResponseMessage("You're offline. Your command will be processed when you reconnect.");
      updatePendingCount();
      setIsProcessingCommand(false);
      return;
    }

    try {
      // 2. Call AI for intent parsing
      console.log('Parsing voice command with AI:', text);
      const parsedCommand: ParsedCommand = await parseVoiceCommand(text);
      console.log('Parsed command:', parsedCommand);

      // 3. Perform action based on intent type
      let aiResponseText = '';
      switch (parsedCommand.type) {
        case 'message':
          // If AI provides a refined content, update the user's message
          if (parsedCommand.content && parsedCommand.content !== text) {
            // Update the user's message in Zustand
            updateMessage(userMessage.id, { text: parsedCommand.content });
            // Update the user's message in the database
            await updateMessageText(userMessage.id, parsedCommand.content);
            aiResponseText = parsedCommand.target
              ? `Message refined and sent to ${parsedCommand.target}: "${parsedCommand.content}".`
              : `Message refined and sent: "${parsedCommand.content}".`;
          } else {
            aiResponseText = parsedCommand.target
              ? `Message "${text}" sent to ${parsedCommand.target}.`
              : `Message "${text}" sent.`;
          }
          break;

        case 'task':
          const newTask: Task = {
            id: uuidv4(),
            title: parsedCommand.content,
            description: parsedCommand.details,
            dueDate: parsedCommand.dueDate ? new Date(parsedCommand.dueDate).getTime() : null,
            completed: false,
            createdAt: Date.now(),
            version: 1,
          };
          await saveTask(newTask);
          addTask(newTask); // Add to Zustand store
          aiResponseText = `Task "${newTask.title}" added.`;
          if (newTask.dueDate) {
            aiResponseText += ` Due: ${new Date(newTask.dueDate).toLocaleDateString()}.`;
          }
          break;

        case 'query':
          // Gather context: recent messages and tasks
          const context = {
            recentMessages: messages.slice(0, 10).map(msg => ({
              user: msg.userId,
              text: msg.text,
              timestamp: new Date(msg.timestamp).toLocaleString()
            })),
            openTasks: tasks.filter(task => !task.completed).map(task => ({
              title: task.title,
              description: task.description,
              dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'
            })),
          };
          console.log('Generating AI response for query with context:', context);
          const aiQueryResponse = await generateResponse(parsedCommand.content, context);
          aiResponseText = aiQueryResponse; // AI's direct response
          break;

        case 'status_update':
          aiResponseText = `Status updated: "${parsedCommand.content}".`;
          // Future: integrate with backend for actual status update or send a special message
          break;

        default:
          aiResponseText = "I'm not sure how to handle that command type.";
          break;
      }

      // Add AI's confirmation/response message
      if (aiResponseText) {
        await addAiResponseMessage(aiResponseText);
      }

    } catch (error) {
      console.error('Error processing voice command:', error);
      await addAiResponseMessage("Sorry, I encountered an error processing your command. Please try again.");
    } finally {
      setIsProcessingCommand(false);
    }
  }

  const handleSyncPress = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const syncedCount = await syncPendingMessages();
      if (syncedCount > 0) {
        Alert.alert('Sync Complete', `${syncedCount} messages synced.`);
        loadMessages();
        updatePendingCount();
      } else {
        Alert.alert('Sync Complete', 'No pending messages to sync.');
      }
    } catch (error) {
      console.error('Manual sync failed:', error);
      Alert.alert('Sync Failed', 'Could not sync messages. Please check your connection.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {!isConnected && (
          <View style={styles.offlineIndicator}>
            <Text style={styles.offlineText}>Offline Mode</Text>
          </View>
        )}
        {pendingCount > 0 && (
          <TouchableOpacity onPress={handleSyncPress} style={styles.syncButton} disabled={isSyncing}>
            {isSyncing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.syncButtonText}>Sync ({pendingCount})</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        inverted
        contentContainerStyle={styles.messageListContent}
      />

      <View style={styles.inputContainer}>
        {isProcessingCommand && (
          <View style={styles.processingIndicator}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.processingText}>Processing command...</Text>
          </View>
        )}
        <VoiceButton onTranscript={handleTranscript} disabled={isProcessingCommand} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  offlineIndicator: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  offlineText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  syncButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  messageListContent: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#e0f7fa',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  processingText: {
    marginLeft: 8,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});
