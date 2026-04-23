import React, { useRef, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Canvas } from '../../components/Canvas';
import { PartPalette } from '../../components/PartPalette';
import { PlaybackControls } from '../../components/PlaybackControls';
import { useStore } from '../../lib/store';
import { saveContraption } from '../../lib/storage';
import { useRouter } from 'expo-router';

export default function SandboxScreen() {
  const router = useRouter();
  const { parts, isPremium } = useStore();
  const canvasRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;

    if (parts.length === 0) {
      Alert.alert('Empty Canvas', 'Please add some parts to your contraption before saving.');
      return;
    }

    setIsSaving(true);

    try {
      // Capture thumbnail
      const thumbnail = await captureRef(canvasRef, {
        format: 'jpg',
        quality: 0.5,
        result: 'data-uri',
      });

      const contraption = {
        name: `Contraption ${new Date().toLocaleDateString()}`,
        parts: parts.map(part => ({
          type: part.type,
          x: part.x,
          y: part.y,
          width: part.width,
          height: part.height,
          rotation: part.rotation,
        })),
        thumbnail,
        createdAt: new Date().toISOString(),
      };

      const id = await saveContraption(contraption);
      Alert.alert('Saved!', 'Your contraption has been saved successfully.');
      router.push(`/contraption/${id}`);
    } catch (error) {
      console.error('Error saving contraption:', error);
      Alert.alert('Error', 'Failed to save contraption. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.canvasContainer}>
        <Canvas ref={canvasRef} />
      </View>
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
  canvasContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
