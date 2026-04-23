import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { askMentor, logQuestion, getRemainingQuestions } from '../lib/ai';
import { Issue } from '../types';
import { useAuthStore } from '../store/authStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Button, Card, Avatar, Divider } from 'react-native-paper';

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
      <View style={styles.messageBubble}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestampText}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
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
              <View style={styles.issueContent}>
                <Avatar.Text
                  size={32}
                  label={issue.repository.name.charAt(0).toUpperCase()}
                  style={styles.issueAvatar}
                />
                <View style={styles.issueTextContainer}>
                  <Text style={styles.issueTitle} numberOfLines={1}>
                    {issue.title}
                  </Text>
                  <Text style={styles.issueRepo} numberOfLines={1}>
                    {issue.repository.name}
                  </Text>
                </View>
              </View>
              {selectedIssue?.id === issue.id && (
                <MaterialIcons name="check" size={20} color="#4CAF50" />
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Card style={styles.noIssuesCard}>
            <Card.Content>
              <Text style={styles.noIssuesText}>No claimed issues yet. Claim an issue first!</Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('index')}
                style={styles.claimButton}
              >
                Find Issues
              </Button>
            </Card.Content>
          </Card>
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
            <Button
              mode="outlined"
              onPress={() => setShowPaywall(false)}
              style={styles.modalButton}
            >
              Maybe Later
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                setShowPaywall(false);
                navigation.navigate('subscription');
              }}
              style={[styles.modalButton, styles.upgradeButton]}
            >
              Upgrade Now
            </Button>
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
      <SafeAreaView style={styles.safeArea}>
        {renderIssueSelector()}

        <Divider />

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

          {!isSubscribed && (
            <View style={styles.questionsCounter}>
              <Text style={styles.questionsText}>
                Free questions remaining: {remainingQuestions}/5
              </Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about your issue..."
              multiline
              blurOnSubmit={false}
              onSubmitEditing={handleSend}
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
        </View>

        {renderPaywallModal()}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  safeArea: {
    flex: 1,
  },
  issueSelector: {
    padding: 16,
    backgroundColor: '#fff',
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  issueList: {
    marginTop: 8,
  },
  issueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
  },
  selectedIssue: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  issueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  issueAvatar: {
    marginRight: 12,
    backgroundColor: '#2196f3',
  },
  issueTextContainer: {
    flex: 1,
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  issueRepo: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  noIssuesCard: {
    marginTop: 16,
    backgroundColor: '#fff',
  },
  noIssuesText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  claimButton: {
    marginTop: 8,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 80,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  userMessageBubble: {
    backgroundColor: '#2196f3',
  },
  aiMessageBubble: {
    backgroundColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timestampText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  questionsCounter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  questionsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    backgroundColor: '#f9f9f9',
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#b3e5fc',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  modalButton: {
    marginHorizontal: 8,
  },
  upgradeButton: {
    backgroundColor: '#4CAF50',
  },
});

export default MentorChat;
