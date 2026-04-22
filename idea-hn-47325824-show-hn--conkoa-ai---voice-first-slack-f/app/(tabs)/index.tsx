import { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, Alert } from 'react-native';
import { useMessageStore } from '../../store/messages';
import { useTaskStore } from '../../store/tasks'; // Import task store
import { getMessages, saveMessage, saveTask } from '../../lib/db'; // Import saveTask
import VoiceButton from '../../components/VoiceButton';
import MessageBubble from '../../components/MessageBubble';
import NetInfo from '@react-native-community/netinfo';
import { queueOfflineMessage, syncPendingMessages } from '../../lib/sync';
import { Message, Task, ParsedCommand } from '../../types'; // Import types
import { parseVoiceCommand, generateResponse } from '../../lib/ai'; // Import AI functions
import 'react-native-get-random-values'; // Required for uuid v4
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

export default function MessagesScreen() {
  const { messages, setMessages, addMessage, updateMessage } = useMessageStore();
  const { addTask } = useTaskStore(); // Get addTask from task store
  const [channelId] = useState('default');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isProcessingCommand, setIsProcessingCommand] = useState(false); // New state for AI processing

  const loadMessages = useCallback(async () => {
    console.log('Loading messages from DB...');
    const msgs = await getMessages(channelId);
    setMessages(msgs);
    console.log(`Loaded ${msgs.length} messages.`);
  }, [channelId, setMessages]);

  useEffect(() => {
    loadMessages();

    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Network state changed:', state.isConnected);
      if (state.isConnected && !isSyncing) {
        console.log('Network reconnected, attempting to sync pending messages...');
        setIsSyncing(true);
        syncPendingMessages()
          .then(syncedCount => {
            if (syncedCount > 0) {
              console.log(`Synced ${syncedCount} pending messages.`);
              loadMessages();
            }
          })
          .catch(err => console.error('Error during sync:', err))
          .finally(() => setIsSyncing(false));
      }
    });

    return () => unsubscribe();
  }, [loadMessages, isSyncing]);

  // Helper function to add an AI response message to the chat
  const addAiResponseMessage = async (text: string) => {
    const aiMessage: Message = {
      id: uuidv4(),
      channelId,
      userId: 'AI-Assistant', // Indicate it's from the AI
      text,
      timestamp: Date.now(),
      synced: true, // AI responses are assumed to be generated online
    };
    await saveMessage(aiMessage, true);
    addMessage(aiMessage);
  };

  async function handleTranscript(text: string) {
    setIsProcessingCommand(true); // Start AI processing indicator
    const netInfo = await NetInfo.fetch();
    const isConnected = netInfo.isConnected;

    // First, display the user's transcribed message
    const userMessage: Message = {
      id: uuidv4(),
      channelId,
      userId: 'current-user',
      text,
      timestamp: Date.now(),
      synced: isConnected,
    };
    addMessage(userMessage); // Optimistically add to UI
    await saveMessage(userMessage, isConnected); // Save to DB immediately

    if (!isConnected) {
      // If offline, just queue the user's message and inform them
      console.log('Offline, queuing message for later sync.');
      await queueOfflineMessage(userMessage);
      updateMessage(userMessage.id, { synced: false }); // Ensure UI reflects offline status
      addAiResponseMessage("You're offline. Your command will be processed when you reconnect.");
      setIsProcessingCommand(false);
      return;
    }

    try {
      console.log('Parsing voice command with AI:', text);
      const parsedCommand: ParsedCommand = await parseVoiceCommand(text);
      console.log('Parsed command:', parsedCommand);

      switch (parsedCommand.type) {
        case 'message':
          // The user's message is already added and saved.
          // If the AI confirms it's a message, no further action is strictly needed here
          // unless we want to send it to a specific 'message' backend endpoint
          // after AI parsing, which is not in the current spec.
          console.log('Command identified as a message. Already handled by initial message display.');
          // Optionally, if we want to explicitly confirm, or if 'message' implies sending to a backend:
          // await addAiResponseMessage("Message noted.");
          break;

        case 'task':
          const newTask: Task = {
            id: uuidv4(),
            title: parsedCommand.content,
            description: parsedCommand.content, // Use content as description for now
            dueDate: parsedCommand.dueDate,
            completed: false,
            createdAt: Date.now(),
          };
          await saveTask(newTask); // Save to local DB
          addTask(newTask); // Add to Zustand store
          console.log('Task created:', newTask);
          await addAiResponseMessage(`Task "${newTask.title}" added to your list.`);
          break;

        case 'query':
          console.log('Command identified as a query. Generating response...');
          // Gather context: recent messages and tasks
          const context = {
            recentMessages: messages.slice(0, 5).map(m => ({ userId: m.userId, text: m.text, timestamp: m.timestamp })),
            recentTasks: useTaskStore.getState().tasks.slice(0, 5).map(t => ({ title: t.title, completed: t.completed, dueDate: t.dueDate })),
          };
          const aiResponseText = await generateResponse(parsedCommand.content, [context]);
          await addAiResponseMessage(aiResponseText);
          console.log('AI responded to query:', aiResponseText);
          break;

        case 'status_update':
        case 'check_in':
          console.log(`Command identified as ${parsedCommand.type}.`);
          // For now, just confirm with an AI message.
          // In a real app, this might trigger a specific backend API call or log an event.
          await addAiResponseMessage(`Acknowledged: ${parsedCommand.content}.`);
          break;

        default:
          console.log('Unknown command type:', parsedCommand.type);
          await addAiResponseMessage("I'm not sure how to handle that command. Could you please rephrase?");
          break;
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      await addAiResponseMessage("Sorry, I encountered an error trying to process your command.");
    } finally {
      setIsProcessingCommand(false); // End AI processing indicator
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        inverted
      />
      {isProcessingCommand && (
        <View style={styles.processingIndicator}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.processingText}>Processing command...</Text>
        </View>
      )}
      <VoiceButton onTranscript={handleTranscript} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F0F2F5', // Light background for chat
  },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  processingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
});
