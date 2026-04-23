import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, TextInput, TouchableOpacity, Text } from 'react-native';
import { Avatar, IconButton } from 'react-native-paper';
import { getMessagesForMatch, sendMessage, markMessagesAsRead } from '../lib/messaging';
import { Message } from '../lib/types';

interface MessageListProps {
  matchId: number;
  currentUserId: number;
  onSendMessage?: (message: Message) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  matchId,
  currentUserId,
  onSendMessage
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // Poll for new messages
    return () => clearInterval(interval);
  }, [matchId]);

  const loadMessages = async () => {
    try {
      const fetchedMessages = await getMessagesForMatch(matchId);
      setMessages(fetchedMessages);

      // Mark all unread messages as read
      const unreadMessageIds = fetchedMessages
        .filter(m => m.sender_id !== currentUserId && !m.read_status)
        .map(m => m.id);

      if (unreadMessageIds.length > 0) {
        await markMessagesAsRead(unreadMessageIds);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const message = await sendMessage(matchId, currentUserId, newMessage.trim());
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      onSendMessage?.(message);

      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.sender_id === currentUserId;
    const messageTime = new Date(item.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        {!isCurrentUser && (
          <Avatar.Text
            size={32}
            label="U"
            style={styles.avatar}
          />
        )}
        <View style={styles.messageContent}>
          <Text style={[
            styles.messageText,
            isCurrentUser ? styles.currentUserText : styles.otherUserText
          ]}>
            {item.content}
          </Text>
          <Text style={styles.messageTime}>{messageTime}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <IconButton
          icon="send"
          size={24}
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
  },
  avatar: {
    marginRight: 8,
    marginTop: 4,
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    padding: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  currentUserText: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  otherUserText: {
    backgroundColor: 'white',
    color: 'black',
  },
  messageTime: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: 'white',
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
  },
});

export default MessageList;
