import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { serializeCanvas } from '../lib/drawing';

const COLORS = [
  '#FF5733', '#33FF57', '#3357FF', '#F033FF',
  '#FF33F0', '#33FFF0', '#FF8C33', '#8C33FF'
];

export const useCollaboration = (shareId: string) => {
  const [activeUsers, setActiveUsers] = useState<Array<{
    id: string;
    name: string;
    color: string;
  }>>([]);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    color: string;
  } | null>(null);
  const [cursors, setCursors] = useState<Array<{
    x: number;
    y: number;
    userId: string;
  }>>([]);
  const channelRef = useRef<any>(null);
  const userIdRef = useRef<string>(Math.random().toString(36).substring(2, 9));
  const userColorRef = useRef<string>(COLORS[Math.floor(Math.random() * COLORS.length)]);

  // Initialize current user
  useEffect(() => {
    const userName = `User ${Math.floor(Math.random() * 1000)}`;
    const user = {
      id: userIdRef.current,
      name: userName,
      color: userColorRef.current,
    };
    setCurrentUser(user);
  }, []);

  // Connect to collaboration channel
  const connectToCollaboration = useCallback(() => {
    if (!shareId) return;

    // Create a unique channel name for this drawing
    const channelName = `drawing:${shareId}`;

    // Subscribe to the channel
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userIdRef.current,
        },
      },
    });

    // Track presence state
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const users = Object.values(state).flat() as Array<{
        id: string;
        name: string;
        color: string;
      }>;
      setActiveUsers(users);
    });

    // Track element changes
    channel.on('broadcast', { event: 'element_change' }, ({ payload }) => {
      if (payload.userId !== userIdRef.current) {
        handleRemoteElementChange(payload.type, payload.data);
      }
    });

    // Track cursor movements
    channel.on('broadcast', { event: 'cursor_move' }, ({ payload }) => {
      if (payload.userId !== userIdRef.current) {
        handleRemoteCursorMove(payload.x, payload.y, payload.userId);
      }
    });

    // Subscribe to the channel
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Join presence
        await channel.track({
          id: userIdRef.current,
          name: currentUser?.name || 'Anonymous',
          color: userColorRef.current,
        });
      }
    });

    channelRef.current = channel;
  }, [shareId, currentUser]);

  // Disconnect from collaboration
  const disconnectFromCollaboration = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
  }, []);

  // Broadcast element changes
  const broadcastElementChange = useCallback((type: string, data: any) => {
    if (channelRef.current && currentUser) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'element_change',
        payload: {
          type,
          data,
          userId: userIdRef.current,
        },
      });
    }
  }, [currentUser]);

  // Broadcast cursor movements
  const broadcastCursorMove = useCallback((x: number, y: number) => {
    if (channelRef.current && currentUser) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'cursor_move',
        payload: {
          x,
          y,
          userId: userIdRef.current,
        },
      });
    }
  }, [currentUser]);

  // Handle remote element changes
  const handleRemoteElementChange = useCallback((type: string, data: any) => {
    // Implement conflict resolution logic here
    // For now, just apply the changes directly
    switch (type) {
      case 'element_added':
        // Add the new element to the canvas
        break;
      case 'element_updated':
        // Update the specified element
        break;
      case 'element_removed':
        // Remove the specified element
        break;
    }
  }, []);

  // Handle remote cursor movements
  const handleRemoteCursorMove = useCallback((x: number, y: number, userId: string) => {
    setCursors(prev => {
      // Update or add the cursor position
      const existingIndex = prev.findIndex(c => c.userId === userId);
      if (existingIndex >= 0) {
        const newCursors = [...prev];
        newCursors[existingIndex] = { x, y, userId };
        return newCursors;
      }
      return [...prev, { x, y, userId }];
    });
  }, []);

  return {
    activeUsers,
    currentUser,
    cursors,
    connectToCollaboration,
    disconnectFromCollaboration,
    broadcastElementChange,
    broadcastCursorMove,
    handleRemoteElementChange,
    handleRemoteCursorMove,
  };
};
