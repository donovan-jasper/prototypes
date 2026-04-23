import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { askMentor, logQuestion, getRemainingQuestions } from '../lib/ai';
import { Issue } from '../types';
import { useAuthStore } from '../store/authStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface MentorChatProps {
  claimedIssues: Issue[];
  isSubscribed: boolean;
}

const MentorChat: React.FC<MentorChatProps> = ({ claimedIssues, isSubscribed }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [remainingQuestions, setRemainingQuestions] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        text: 'Hello! I\'m your AI mentor. Ask me about any of your claimed issues.',
        isUser: false,
        timestamp: new Date()
      }]);
    }

    // Update remaining questions count
    if (user?.id) {
      setRemainingQuestions(getRemainingQuestions(user.id));
    }
  }, [user]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    if (!selectedIssue) {
      Alert.alert('Select Issue', 'Please select an issue to ask about first.');
      return;
    }

    if (!isSubscribed && remainingQuestions <= 0) {
      setShowPaywall(true);
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Add typing indicator
    const typingId = Date.now().toString() + '-typing';
    const typingMessage: Message = {
      id: typingId,
      text: 'Typing...',
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, typingMessage]);
    setIsLoading(true);

    try {
      // Get AI response
      const response = await askMentor(inputText, selectedIssue);

      // Remove typing indicator and add AI response
      setMessages(prev => {
        const updated = prev.filter(msg => msg.id !== typingId);
        return [...updated, {
          id: Date.now().toString(),
          text: response,
          isUser: false,
          timestamp: new Date()
        }];
      });

      // Log the question for free users
      if (!isSubscribed && user?.id) {
        const success = logQuestion(user.id);
        if (success) {
          setRemainingQuestions(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => {
        const updated = prev.filter(msg => msg.id !== typingId);
        return [...updated, {
          id: Date.now().toString(),
          text: 'Sorry, I encountered an error. Please try again.',
          isUser: false,
          timestamp: new Date()
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.aiMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestampText}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  const renderIssueSelector = () => (
    <View style={styles.issueSelector}>
      <Text style={styles.selectorLabel}>Ask about:</Text>
      <View style={styles.issueList}>
        {claimedIssues.length > 0 ? (
          claimedIssues.map(issue => (
            <TouchableOpacity
              key={issue.id}
              style={[
                styles.issueButton,
                selectedIssue?.id === issue.id && styles.selectedIssue
              ]}
              onPress={() => setSelectedIssue(issue)}
            >
              <Text style={styles.issueText} numberOfLines={1}>
                {issue.title} ({issue.repository.name})
              </Text>
              {selectedIssue?.id === issue.id && (
                <MaterialIcons name="check" size={20} color="#4CAF50" />
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noIssuesText}>No claimed issues yet. Claim an issue first!</Text>
        )}
      </View>
    </View>
  );

  const renderPaywallModal = () => (
    <Modal
      visible={showPaywall}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowPaywall(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Upgrade to Ask Unlimited</Text>
          <Text style={styles.modalText}>
            You've used all {isSubscribed ? 'your' : 'your free'} questions for today.
          </Text>
          <Text style={styles.modalText}>
            Upgrade to ask unlimited questions and get code reviews before submitting PRs.
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowPaywall(false)}
            >
              <Text style={styles.buttonText}>Maybe Later</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.upgradeButton]}
              onPress={() => {
                setShowPaywall(false);
                navigation.navigate('settings' as never);
              }}
            >
              <Text style={[styles.buttonText, styles.upgradeText]}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Mentor</Text>
        <View style={styles.questionsCounter}>
          <MaterialIcons name="question-answer" size={16} color="#666" />
          <Text style={styles.counterText}>{remainingQuestions} left</Text>
        </View>
      </View>

      {renderIssueSelector()}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about your issue..."
          multiline
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.sendButton, isLoading && styles.disabledButton]}
          onPress={handleSend}
          disabled={isLoading || !inputText.trim()}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <MaterialIcons name="send" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {renderPaywallModal()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  questionsCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
  issueSelector: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  issueList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  issueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedIssue: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  issueText: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  noIssuesText: {
    fontSize: 14,
    color: '#666',
    padding: 8,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2196f3',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#333',
    fontSize: 16,
  },
  timestampText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196f3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#b0bec5',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  upgradeButton: {
    backgroundColor: '#2196f3',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  upgradeText: {
    color: '#fff',
  },
});

export default MentorChat;
