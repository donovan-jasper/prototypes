import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal, Alert } from 'react-native';
import { askMentor, logQuestion, getRemainingQuestions } from '../lib/ai';
import { Issue } from '../types';
import { useAuthStore } from '../store/authStore';

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
  const { user } = useAuthStore();

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

    if (!isSubscribed && remainingQuestions <= 0) {
      setShowPaywall(true);
      return;
    }

    if (!selectedIssue) {
      Alert.alert('Select Issue', 'Please select an issue to ask about first.');
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
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.aiMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
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
              <Text style={styles.issueText}>{issue.title}</Text>
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
                // Navigate to subscription screen
                setShowPaywall(false);
              }}
            >
              <Text style={styles.modalButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Mentor</Text>
        {!isSubscribed && (
          <Text style={styles.usageText}>
            Questions remaining: {remainingQuestions}
          </Text>
        )}
      </View>

      {renderIssueSelector()}

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesContainer}
        style={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about your issue..."
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || !selectedIssue) && styles.disabledButton
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || !selectedIssue}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {renderPaywallModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#6200ee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  usageText: {
    color: 'white',
    fontSize: 14,
  },
  issueSelector: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  issueList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  issueButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedIssue: {
    backgroundColor: '#6200ee',
  },
  issueText: {
    color: '#333',
  },
  noIssuesText: {
    color: '#666',
    fontStyle: 'italic',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6200ee',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
  },
  messageText: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    padding: 12,
    backgroundColor: '#6200ee',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 8,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 12,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  upgradeButton: {
    backgroundColor: '#6200ee',
  },
  modalButtonText: {
    fontWeight: 'bold',
  },
});

export default MentorChat;
