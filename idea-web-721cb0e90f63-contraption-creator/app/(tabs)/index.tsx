import React, { useRef, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Canvas } from '../../components/Canvas';
import { PartPalette } from '../../components/PartPalette';
import { PlaybackControls } from '../../components/PlaybackControls';
import { useStore } from '../../lib/store';
import { saveContraption } from '../../lib/storage';

export default function SandboxScreen() {
  const canvasRef = useRef(null);
  const { parts, isPremium } = useStore();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;

    if (parts.length === 0) {
      Alert.alert('Nothing to save', 'Add some parts to your contraption first');
      return;
    }

    setIsSaving(true);

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
        createdAt: new Date().toISOString(),
      };

      const id = await saveContraption(contraption);
      Alert.alert('Saved!', 'Your contraption has been saved successfully');
    } catch (error) {
      console.error('Error saving contraption:', error);
      Alert.alert('Error', 'Failed to save contraption. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Canvas ref={canvasRef} />
      <PartPalette />
      <PlaybackControls canvasRef={canvasRef} onSave={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
