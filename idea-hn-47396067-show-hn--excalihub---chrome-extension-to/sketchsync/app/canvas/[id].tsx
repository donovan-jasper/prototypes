import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getDrawing, updateDrawing } from '@/lib/db';
import { Canvas } from '@/components/Canvas';
import { Toolbar } from '@/components/Toolbar';
import { useDrawingStore } from '@/store/useDrawingStore';

export default function CanvasScreen() {
  const { id } = useLocalSearchParams();
  const [drawing, setDrawing] = useState(null);
  const { elements, setElements } = useDrawingStore();

  useEffect(() => {
    loadDrawing();
  }, [id]);

  const loadDrawing = async () => {
    const drawing = await getDrawing(id);
    setDrawing(drawing);
    setElements(JSON.parse(drawing.data));
  };

  const saveDrawing = async () => {
    if (drawing) {
      await updateDrawing(drawing.id, { data: JSON.stringify(elements) });
    }
  };

  useEffect(() => {
    const interval = setInterval(saveDrawing, 5000);
    return () => clearInterval(interval);
  }, [elements]);

  return (
    <View style={styles.container}>
      <Canvas />
      <Toolbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
