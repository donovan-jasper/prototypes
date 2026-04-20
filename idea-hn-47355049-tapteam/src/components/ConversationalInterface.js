import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { View, StyleSheet } from 'react-native';

const ConversationalInterface = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Hello! I am RaccoonAI, your collaborative AI agent. How can I assist you today?',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'RaccoonAI',
          avatar: 'https://i.imgur.com/7bM19.png', // Placeholder avatar for RaccoonAI
        },
      },
    ]);
  }, []);

  const onSend = useCallback((newMessages = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, newMessages)
    );

    // Simulate RaccoonAI's response
    const userMessage = newMessages[0].text;
    setTimeout(() => {
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, [
          {
            _id: Math.round(Math.random() * 1000000),
            text: `I received your message: "${userMessage}". How else can I help?`, // Simple static response
            createdAt: new Date(),
            user: {
              _id: 2,
              name: 'RaccoonAI',
              avatar: 'https://i.imgur.com/7bM19.png', // Placeholder avatar for RaccoonAI
            },
          },
        ])
      );
    }, 1000); // Simulate a delay for AI response
  }, []);

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: 1, // Current user ID
        }}
        placeholder="Type your message here..."
        showUserAvatar
        renderUsernameOnMessage
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Light background for the chat area
  },
});

export default ConversationalInterface;
