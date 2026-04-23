import { useEffect, useState } from 'react';
import { useDrawingStore } from '../store/useDrawingStore';
import { CanvasElement } from '../types/drawing';
import { supabase } from '../lib/supabase';

type User = {
  id: string;
  name: string;
  color: string;
};

type CursorPosition = {
  x: number;
  y: number;
  userId: string;
};

export const useCollaboration = (drawingId: string) => {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const { addElements, updateElement, removeElement } = useDrawingStore();

  // Initialize current user
  useEffect(() => {
    const userId = Math.random().toString(36).substring(2, 9);
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33F0'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const user = {
      id: userId,
      name: `User ${userId.substring(0, 4)}`,
      color: randomColor,
    };

    setCurrentUser(user);
    setActiveUsers([user]);

    // Notify others about new user
    supabase.channel(`collab:${drawingId}`)
      .send({
        type: 'broadcast',
        event: 'user_joined',
        payload: user,
      });

    return () => {
      // Notify others about user leaving
      supabase.channel(`collab:${drawingId}`)
        .send({
          type: 'broadcast',
          event: 'user_left',
          payload: { id: userId },
        });
    };
  }, [drawingId]);

  // Listen for real-time updates
  useEffect(() => {
    const channel = supabase.channel(`collab:${drawingId}`);

    // Listen for new elements
    channel.on(
      'broadcast',
      { event: 'element_added' },
      ({ payload }: { payload: CanvasElement }) => {
        addElements([payload]);
      }
    );

    // Listen for element updates
    channel.on(
      'broadcast',
      { event: 'element_updated' },
      ({ payload }: { payload: { id: string; updates: Partial<CanvasElement> } }) => {
        updateElement(payload.id, payload.updates);
      }
    );

    // Listen for element deletions
    channel.on(
      'broadcast',
      { event: 'element_removed' },
      ({ payload }: { payload: { id: string } }) => {
        removeElement(payload.id);
      }
    );

    // Listen for cursor movements
    channel.on(
      'broadcast',
      { event: 'cursor_moved' },
      ({ payload }: { payload: CursorPosition }) => {
        setCursors(prev => {
          const existingIndex = prev.findIndex(c => c.userId === payload.userId);
          if (existingIndex >= 0) {
            const newCursors = [...prev];
            newCursors[existingIndex] = payload;
            return newCursors;
          }
          return [...prev, payload];
        });
      }
    );

    // Listen for user joins
    channel.on(
      'broadcast',
      { event: 'user_joined' },
      ({ payload }: { payload: User }) => {
        setActiveUsers(prev => {
          if (prev.some(u => u.id === payload.id)) return prev;
          return [...prev, payload];
        });
      }
    );

    // Listen for user leaves
    channel.on(
      'broadcast',
      { event: 'user_left' },
      ({ payload }: { payload: { id: string } }) => {
        setActiveUsers(prev => prev.filter(u => u.id !== payload.id));
        setCursors(prev => prev.filter(c => c.userId !== payload.id));
      }
    );

    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [drawingId, addElements, updateElement, removeElement]);

  // Broadcast element changes
  const broadcastElementChange = (event: string, payload: any) => {
    supabase.channel(`collab:${drawingId}`)
      .send({
        type: 'broadcast',
        event,
        payload,
      });
  };

  // Broadcast cursor movements
  const broadcastCursorMove = (x: number, y: number) => {
    if (!currentUser) return;

    const cursorPosition = { x, y, userId: currentUser.id };
    setCursors(prev => {
      const existingIndex = prev.findIndex(c => c.userId === currentUser.id);
      if (existingIndex >= 0) {
        const newCursors = [...prev];
        newCursors[existingIndex] = cursorPosition;
        return newCursors;
      }
      return [...prev, cursorPosition];
    });

    supabase.channel(`collab:${drawingId}`)
      .send({
        type: 'broadcast',
        event: 'cursor_moved',
        payload: cursorPosition,
      });
  };

  return {
    activeUsers,
    currentUser,
    cursors,
    broadcastElementChange,
    broadcastCursorMove,
  };
};
