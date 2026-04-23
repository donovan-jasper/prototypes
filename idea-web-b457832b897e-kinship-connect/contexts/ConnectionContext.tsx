import React, { createContext, useState, useEffect, useContext } from 'react';
import { getConnections, saveConnection, markMessagesAsRead } from '../services/database';
import { AuthContext } from './AuthContext';

interface Connection {
  id: string;
  userId: string;
  matchId: string;
  matchName: string;
  matchPhoto: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  status: string;
  createdAt: number;
}

interface ConnectionContextType {
  connections: Connection[];
  loading: boolean;
  refreshConnections: () => Promise<void>;
  markAsRead: (connectionId: string) => Promise<void>;
  addConnection: (connection: Connection) => Promise<void>;
}

export const ConnectionContext = createContext<ConnectionContextType>({
  connections: [],
  loading: false,
  refreshConnections: async () => {},
  markAsRead: async () => {},
  addConnection: async () => {},
});

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      loadConnections();
    }
  }, [user]);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const fetchedConnections = await getConnections(user?.id || '');
      setConnections(fetchedConnections);
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshConnections = async () => {
    await loadConnections();
  };

  const markAsRead = async (connectionId: string) => {
    try {
      await markMessagesAsRead(connectionId, user?.id || '');
      setConnections(prev =>
        prev.map(conn =>
          conn.id === connectionId ? { ...conn, unreadCount: 0 } : conn
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const addConnection = async (connection: Connection) => {
    try {
      await saveConnection(connection);
      setConnections(prev => [connection, ...prev]);
    } catch (error) {
      console.error('Error adding connection:', error);
    }
  };

  return (
    <ConnectionContext.Provider
      value={{
        connections,
        loading,
        refreshConnections,
        markAsRead,
        addConnection,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};
