import { useState, useEffect } from 'react';
import { saveMessageOffline, getOfflineMessages } from '../storage';

const useOfflineMessages = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const loadMessages = async () => {
      const offlineMessages = await getOfflineMessages();
      setMessages(offlineMessages);
    };

    loadMessages();
  }, []);

  const addMessage = async (message) => {
    await saveMessageOffline(message);
    setMessages([...messages, message]);
  };

  return { messages, addMessage };
};

export default useOfflineMessages;
