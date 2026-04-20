import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { View, StyleSheet } from 'react-native';
import RaccoonAIService from '../services/RaccoonAIService'; // Import the RaccoonAIService

const RaccoonAIAvatar = 'https://i.imgur.com/7bM19.png'; // Placeholder avatar for RaccoonAI

const ConversationalInterface = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Initial message from RaccoonAI
    setMessages([
      {
        _id: 1,
        text: 'Hello! I am RaccoonAI, your collaborative AI agent. How can I assist you today?',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'RaccoonAI',
          avatar: RaccoonAIAvatar,
        },
      },
    ]);
  }, []);

  const onSend = useCallback(async (newMessages = []) => {
    // Add user's message to the chat
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, newMessages)
    );

    const userMessage = newMessages[0].text;

    try {
      // Call RaccoonAIService to get an AI response
      const aiResponseText = await RaccoonAIService.sendMessage(userMessage);

      // Create the AI's message object
      const aiMessage = {
        _id: Math.round(Math.random() * 1000000), // Unique ID for the AI message
        text: aiResponseText,
        createdAt: new Date(),
        user: {
          _id: 2, // RaccoonAI's user ID
          name: 'RaccoonAI',
          avatar: RaccoonAIAvatar,
        },
      };

      // Add AI's message to the chat
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, [aiMessage])
      );
    } catch (error) {
      console.error("Error getting AI response:", error);
      // Optionally, display an error message to the user
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, [
          {
            _id: Math.round(Math.random() * 1000000),
            text: "Oops! Something went wrong. Please try again.",
            createdAt: new Date(),
            user: {
              _id: 2,
              name: 'RaccoonAI',
              avatar: RaccoonAIAvatar,
            },
          },
        ])
      );
    }
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
