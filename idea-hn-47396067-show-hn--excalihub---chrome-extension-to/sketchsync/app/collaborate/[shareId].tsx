import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getSharedDrawing } from '@/lib/sync';
import { Canvas } from '@/components/Canvas';
import { Toolbar } from '@/components/Toolbar';
import { CollaborationBar } from '@/components/CollaborationBar';
import { useDrawingStore } from '@/store/useDrawingStore';

export default function CollaborationScreen() {
  const { shareId } = useLocalSearchParams();
  const [drawing, setDrawing] = useState(null);
  const { elements, setElements } = useDrawingStore();

  useEffect(() => {
    loadSharedDrawing();
  }, [shareId]);

  const loadSharedDrawing = async () => {
    const drawing = await getSharedDrawing(shareId);
    setDrawing(drawing);
    setElements(JSON.parse(drawing.data));
  };

  return (
    <View style={styles.container}>
      <Canvas />
      <Toolbar />
      <CollaborationBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
