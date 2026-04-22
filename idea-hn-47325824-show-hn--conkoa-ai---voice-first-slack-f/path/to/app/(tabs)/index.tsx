import { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useMessageStore } from '../../store/messages';
import { getMessages, saveMessage, saveTask } from '../../lib/db';
import VoiceButton from '../../components/VoiceButton';
import MessageBubble from '../../components/MessageBubble';
import { parseVoiceCommand, generateResponse } from '../../lib/ai';
import { useTaskStore } from '../../store/tasks';
import { Message, ParsedCommand, Task } from '../../types';

export default function MessagesScreen() {
  const { messages, setMessages, addMessage } = useMessageStore();
  const { addTask } = useTaskStore();
  const [channelId] = useState('default'); // Default channel for now
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    try {
      const msgs = await getMessages(channelId);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages.');
    }
  }

  async function handleTranscript(text: string) {
    setIsLoading(true);
    setError(null);
    const currentUserId = 'current-user'; // Placeholder for actual user ID

    try {
      // First, save the user's transcribed input as a message
      const userMessage: Message = {
        id: Date.now().toString(),
        channelId,
        userId: currentUserId,
        text,
        timestamp: Date.now(),
      };
      await saveMessage(userMessage);
      addMessage(userMessage);

      // Now, parse the command using AI
      const parsedCommand: ParsedCommand = await parseVoiceCommand(text);
      console.log('Parsed Command:', parsedCommand);

      let aiResponseText: string | null = null;

      switch (parsedCommand.type) {
        case 'message':
        case 'status_update':
          // Already handled by saving the user's message above.
          // If there's a specific AI response needed for these, it would go here.
          // For now, just confirm.
          aiResponseText = `Understood: "${parsedCommand.content}".`;
          break;

        case 'task':
          const newTask: Task = {
            id: `task-${Date.now()}`,
            title: parsedCommand.content,
            description: parsedCommand.content, // Use content as description for now
            dueDate: parsedCommand.dueDate ? new Date(parsedCommand.dueDate).getTime() : undefined,
            completed: false,
            createdAt: Date.now(),
          };
          await saveTask(newTask);
          addTask(newTask); // Add to Zustand store
          aiResponseText = `Task "${newTask.title}" added to your list.`;
          break;

        case 'query':
          // Provide context to the AI for the query
          const recentMessagesContext = messages.slice(0, 10).map(msg => ({
            role: msg.userId === currentUserId ? 'user' : 'assistant',
            content: msg.text,
          }));
          const context = [
            { role: 'system', content: 'You are a helpful assistant for field workers. Answer questions based on provided context.' },
            ...recentMessagesContext,
            { role: 'user', content: parsedCommand.content }
          ];
          aiResponseText = await generateResponse(parsedCommand.content, context);
          break;

        default:
          aiResponseText = "I'm not sure how to handle that command. Can you rephrase?";
          break;
      }

      // If there's an AI response, save and display it
      if (aiResponseText) {
        const aiMessage: Message = {
          id: Date.now().toString() + '-ai',
          channelId,
          userId: 'AI-Assistant', // Unique ID for AI
          text: aiResponseText,
          timestamp: Date.now() + 1, // Ensure it appears after user's message
        };
        await saveMessage(aiMessage);
        addMessage(aiMessage);
      }

    } catch (err) {
      console.error('Error processing voice command:', err);
      setError('Failed to process command. Please try again.');
      // Add an error message to the chat feed
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        channelId,
        userId: 'System',
        text: `Error: ${err instanceof Error ? err.message : String(err)}. Please try again.`,
        timestamp: Date.now() + 1,
      };
      await saveMessage(errorMessage);
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        inverted
        contentContainerStyle={styles.messageListContent}
      />
      <VoiceButton onTranscript={handleTranscript} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 16,
  },
  messageListContent: {
    paddingBottom: 10, // Add some padding at the bottom of the list
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007AFF',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});
