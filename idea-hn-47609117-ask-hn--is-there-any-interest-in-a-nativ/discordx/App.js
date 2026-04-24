import React from 'react';
import { View } from 'react-native';
import MessageList from './src/components/MessageList';
import useOfflineMessages from './src/hooks/useOfflineMessages';
import { usePerformanceOptimization } from './src/utils/performance';
import { initDB } from './src/storage';

const App = () => {
  const { messages, addMessage } = useOfflineMessages();
  usePerformanceOptimization();

  // Initialize database
  initDB();

  // Example: Add a message
  // addMessage({ id: '1', text: 'Hello' });

  return (
    <View style={{ flex: 1 }}>
      <MessageList messages={messages} />
    </View>
  );
};

export default App;
