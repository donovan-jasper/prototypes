import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useCollaboration } from '../../hooks/useCollaboration';
import Canvas from '../../components/Canvas';
import CollaborationBar from '../../components/CollaborationBar';
import { supabase } from '../../lib/supabase';
import { deserializeCanvas, serializeCanvas } from '../../lib/drawing';

const CollaborateScreen = () => {
  const { shareId } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [drawingData, setDrawingData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  const {
    activeUsers,
    currentUser,
    cursors,
    broadcastElementChange,
    broadcastCursorMove,
    connectToCollaboration,
    disconnectFromCollaboration,
    handleRemoteElementChange,
    handleRemoteCursorMove,
  } = useCollaboration(shareId as string);

  // Load drawing data from Supabase
  useEffect(() => {
    const loadDrawing = async () => {
      try {
        const { data, error } = await supabase
          .from('drawings')
          .select('data')
          .eq('share_id', shareId)
          .single();

        if (error) throw error;

        const deserializedData = deserializeCanvas(data.data);
        setDrawingData(deserializedData);
      } catch (err) {
        console.error('Error loading drawing:', err);
        Alert.alert('Error', 'Failed to load drawing. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDrawing();
  }, [shareId]);

  // Connect to collaboration when drawing is loaded
  useEffect(() => {
    if (drawingData && !isConnected) {
      connectToCollaboration();
      setIsConnected(true);
    }

    return () => {
      if (isConnected) {
        disconnectFromCollaboration();
      }
    };
  }, [drawingData, isConnected, connectToCollaboration, disconnectFromCollaboration]);

  const handleElementAdded = useCallback((element: any) => {
    broadcastElementChange('element_added', element);
  }, [broadcastElementChange]);

  const handleElementUpdated = useCallback((id: string, updates: any) => {
    broadcastElementChange('element_updated', { id, updates });
  }, [broadcastElementChange]);

  const handleElementRemoved = useCallback((id: string) => {
    broadcastElementChange('element_removed', { id });
  }, [broadcastElementChange]);

  const handleCursorMove = useCallback((x: number, y: number) => {
    broadcastCursorMove(x, y);
  }, [broadcastCursorMove]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!drawingData) {
    return (
      <View style={styles.errorContainer}>
        <Text>Failed to load drawing</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Canvas
        initialElements={drawingData.elements || []}
        onElementAdded={handleElementAdded}
        onElementUpdated={handleElementUpdated}
        onElementRemoved={handleElementRemoved}
        onCursorMove={handleCursorMove}
        cursors={cursors}
        activeUsers={activeUsers}
      />
      <CollaborationBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CollaborateScreen;
