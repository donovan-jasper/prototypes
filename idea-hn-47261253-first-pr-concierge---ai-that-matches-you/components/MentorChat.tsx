import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native';
import { askMentor, logQuestion, getRemainingQuestions } from '../lib/ai';
import { Issue } from '../types';
import { useAuthStore } from '../store/authStore';
import { MaterialIcons } from '@expo/vector-icons';

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
                // TODO: Implement actual upgrade flow
                Alert.alert('Upgrade', 'This would open the subscription screen');
              }}
            >
              <Text style={[styles.modalButtonText, styles.upgradeButtonText]}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
          {!isSubscribed && (
            <Text style={styles.remainingText}>
              Questions remaining today: {remainingQuestions}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {renderIssueSelector()}

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatContainer}
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about your issue..."
          placeholderTextColor="#999"
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

      {!isSubscribed && (
        <View style={styles.remainingContainer}>
          <Text style={styles.remainingText}>
            Questions remaining today: {remainingQuestions}
          </Text>
        </View>
      )}

      {renderPaywallModal()}
    </View>
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
    borderBottomColor: '#eee',
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
  },
  issueText: {
    fontSize: 14,
    color: '#333',
    maxWidth: 200,
  },
  noIssuesText: {
    fontSize: 14,
    color: '#666',
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  timestampText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  remainingContainer: {
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  remainingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    marginBottom: 24,
    color: '#666',
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
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  upgradeButtonText: {
    color: '#fff',
  },
});

export default MentorChat;
