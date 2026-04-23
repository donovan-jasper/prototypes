import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { CanvasElement, Cursor } from '../types/drawing';

interface User {
  id: string;
  name: string;
  color: string;
}

interface CollaborationHook {
  activeUsers: User[];
  currentUser: User | null;
  cursors: Record<string, Cursor>;
  broadcastElementChange: (type: 'element_added' | 'element_updated' | 'element_removed', payload: any) => void;
  broadcastCursorMove: (x: number, y: number) => void;
  connectToCollaboration: () => void;
  disconnectFromCollaboration: () => void;
  handleRemoteElementChange: (type: string, payload: any) => void;
  handleRemoteCursorMove: (userId: string, x: number, y: number) => void;
}

export const useCollaboration = (shareId: string): CollaborationHook => {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cursors, setCursors] = useState<Record<string, Cursor>>({});
  const [channel, setChannel] = useState<any>(null);

  // Generate a random color for the current user
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Initialize current user
  useEffect(() => {
    const userId = uuidv4();
    const userName = `User ${Math.floor(Math.random() * 1000)}`;
    const userColor = getRandomColor();

    setCurrentUser({
      id: userId,
      name: userName,
      color: userColor,
    });
  }, []);

  // Connect to Supabase realtime channel
  const connectToCollaboration = useCallback(() => {
    if (!currentUser) return;

    const channelName = `collaboration-${shareId}`;
    const newChannel = supabase.channel(channelName, {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    });

    // Track presence state
    newChannel.on('presence', { event: 'sync' }, () => {
      const newState = newChannel.presenceState();
      const users = Object.values(newState).flat() as User[];
      setActiveUsers(users);
    });

    // Track cursor movements
    newChannel.on(
      'broadcast',
      { event: 'cursor_move' },
      ({ payload }) => {
        setCursors(prev => ({
          ...prev,
          [payload.userId]: { x: payload.x, y: payload.y },
        }));
      }
    );

    // Track element changes
    newChannel.on(
      'broadcast',
      { event: 'element_change' },
      ({ payload }) => {
        handleRemoteElementChange(payload.type, payload.data);
      }
    );

    newChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await newChannel.track({
          id: currentUser.id,
          name: currentUser.name,
          color: currentUser.color,
        });
      }
    });

    setChannel(newChannel);
  }, [shareId, currentUser]);

  // Disconnect from channel
  const disconnectFromCollaboration = useCallback(() => {
    if (channel) {
      channel.unsubscribe();
      setChannel(null);
    }
  }, [channel]);

  // Broadcast element changes to other users
  const broadcastElementChange = useCallback((type: string, data: any) => {
    if (channel && currentUser) {
      channel.send({
        type: 'broadcast',
        event: 'element_change',
        payload: {
          type,
          data,
          userId: currentUser.id,
        },
      });
    }
  }, [channel, currentUser]);

  // Broadcast cursor movements
  const broadcastCursorMove = useCallback((x: number, y: number) => {
    if (channel && currentUser) {
      channel.send({
        type: 'broadcast',
        event: 'cursor_move',
        payload: {
          userId: currentUser.id,
          x,
          y,
        },
      });
    }
  }, [channel, currentUser]);

  // Handle remote element changes
  const handleRemoteElementChange = useCallback((type: string, payload: any) => {
    // This would be implemented in the parent component
    // to update the local state based on remote changes
  }, []);

  // Handle remote cursor movements
  const handleRemoteCursorMove = useCallback((userId: string, x: number, y: number) => {
    setCursors(prev => ({
      ...prev,
      [userId]: { x, y },
    }));
  }, []);

  return {
    activeUsers,
    currentUser,
    cursors,
    broadcastElementChange,
    broadcastCursorMove,
    connectToCollaboration,
    disconnectFromCollaboration,
    handleRemoteElementChange,
    handleRemoteCursorMove,
  };
};
