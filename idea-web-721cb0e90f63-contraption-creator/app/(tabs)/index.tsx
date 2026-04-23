import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Canvas } from '../../components/Canvas';
import { PartPalette } from '../../components/PartPalette';
import { PlaybackControls } from '../../components/PlaybackControls';
import { useStore } from '../../lib/store';
import { saveContraption } from '../../lib/storage';
import { useRouter } from 'expo-router';

export default function SandboxScreen() {
  const canvasRef = useRef(null);
  const { parts, isPlaying, isPremium } = useStore();
  const router = useRouter();

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
        isPremium: parts.some(part => part.isPremium),
      };

      const id = await saveContraption(contraption);
      Alert.alert('Saved', 'Your contraption has been saved!');
      router.push(`/contraption/${id}`);
    } catch (error) {
      console.error('Error saving contraption:', error);
      Alert.alert('Error', 'Failed to save contraption. Please try again.');
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
