import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Canvas } from '../../components/Canvas';
import { PartPalette } from '../../components/PartPalette';
import { PlaybackControls } from '../../components/PlaybackControls';
import { useStore } from '../../lib/store';
import { saveContraption } from '../../lib/storage';
import { useRouter } from 'expo-router';

export default function SandboxScreen() {
  const router = useRouter();
  const canvasRef = useRef(null);
  const { parts, isPremium } = useStore();
  const [contraptionId, setContraptionId] = useState<string | null>(null);

  useEffect(() => {
    // Load contraption if editing existing
    const id = router.params?.id as string;
    if (id) {
      setContraptionId(id);
    }
  }, [router.params]);

  const handleSave = async () => {
    try {
      const contraption = {
        name: `Contraption ${new Date().toLocaleString()}`,
        parts: parts.map(part => ({
          type: part.type,
          x: part.x,
          y: part.y,
          width: part.width,
          height: part.height,
          rotation: part.rotation,
        })),
      };

      const id = await saveContraption(contraption);
      Alert.alert('Success', 'Contraption saved!');
      router.push(`/contraption/${id}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save contraption. Please try again.');
      console.error('Save error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.canvasContainer}>
        <Canvas ref={canvasRef} />
      </View>
      <PartPalette />
      <PlaybackControls
        canvasRef={canvasRef}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
