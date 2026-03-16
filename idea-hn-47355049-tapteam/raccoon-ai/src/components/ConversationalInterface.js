import React, { useState, useEffect } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import RaccoonAIService from '../services/RaccoonAIService';

const ConversationalInterface = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Hello, I am RaccoonAI! How can I help you today?',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'RaccoonAI',
        },
      },
    ]);
  }, []);

  const onSend = (newMessages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );

    RaccoonAIService.processMessage(newMessages[0].text).then((response) => {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, {
          _id: Math.random().toString(36).substring(7),
          text: response,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'RaccoonAI',
          },
        })
      );
    });
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: 1,
      }}
    />
  );
};

export default ConversationalInterface;
