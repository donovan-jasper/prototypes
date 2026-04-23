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
          <Text style={styles.modalTitle}>Upgrade to Unlimited Questions</Text>
          <Text style={styles.modalText}>
            You've reached your free question limit. Upgrade to ask unlimited questions and get code reviews before submitting PRs.
          </Text>
          <View style={styles.questionsLeftContainer}>
            <MaterialIcons name="question-answer" size={24} color="#6200EE" />
            <Text style={styles.questionsLeftText}>Questions left today: {remainingQuestions}</Text>
          </View>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowPaywall(false)}
            >
              <Text style={styles.modalButtonText}>Maybe Later</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.upgradeButton]}
              onPress={() => {
                setShowPaywall(false);
                // Navigate to subscription screen
                navigation.navigate('Subscription');
              }}
            >
              <Text style={[styles.modalButtonText, styles.upgradeButtonText]}>Upgrade Now</Text>
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
      {renderIssueSelector()}

      <View style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask your AI mentor..."
            placeholderTextColor="#999"
            multiline
            maxHeight={100}
          />
          <TouchableOpacity
            style={[styles.sendButton, isLoading && styles.disabledButton]}
            onPress={handleSend}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <MaterialIcons name="send" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {!isSubscribed && (
          <View style={styles.questionsLeftContainer}>
            <MaterialIcons name="question-answer" size={20} color="#6200EE" />
            <Text style={styles.questionsLeftText}>Questions left: {remainingQuestions}</Text>
          </View>
        )}
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
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedIssue: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#6200EE',
  },
  issueText: {
    fontSize: 14,
    color: '#333',
    maxWidth: 200,
  },
  noIssuesText: {
    fontSize: 14,
    color: '#666',
    padding: 8,
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  messagesList: {
    paddingBottom: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6200EE',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  timestampText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 24,
    backgroundColor: '#fff',
    fontSize: 16,
    minHeight: 50,
    maxHeight: 100,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  questionsLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  questionsLeftText: {
    fontSize: 14,
    color: '#6200EE',
    marginLeft: 8,
    fontWeight: '500',
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
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
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
    marginTop: 16,
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
    backgroundColor: '#6200EE',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  upgradeButtonText: {
    color: '#fff',
  },
});

export default MentorChat;
