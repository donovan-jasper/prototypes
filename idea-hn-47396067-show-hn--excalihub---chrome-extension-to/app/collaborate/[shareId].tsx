import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useCollaboration } from '../../hooks/useCollaboration';
import Canvas from '../../components/Canvas';
import CollaborationBar from '../../components/CollaborationBar';
import { supabase } from '../../lib/supabase';

const CollaborateScreen = () => {
  const { shareId } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [drawingData, setDrawingData] = useState<any>(null);

  const {
    activeUsers,
    currentUser,
    cursors,
    broadcastElementChange,
    broadcastCursorMove,
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

        setDrawingData(data.data);
      } catch (err) {
        console.error('Error loading drawing:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDrawing();
  }, [shareId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Canvas
        initialElements={drawingData?.elements || []}
        onElementAdded={(element) => {
          broadcastElementChange('element_added', element);
        }}
        onElementUpdated={(id, updates) => {
          broadcastElementChange('element_updated', { id, updates });
        }}
        onElementRemoved={(id) => {
          broadcastElementChange('element_removed', { id });
        }}
        onCursorMove={broadcastCursorMove}
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
});

export default CollaborateScreen;
