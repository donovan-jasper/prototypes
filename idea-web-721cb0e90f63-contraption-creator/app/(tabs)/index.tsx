import React, { useRef, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Canvas } from '../../components/Canvas';
import { PartPalette } from '../../components/PartPalette';
import { PlaybackControls } from '../../components/PlaybackControls';
import { useStore } from '../../lib/store';
import { saveContraption } from '../../lib/storage';
import { useRouter } from 'expo-router';

export default function SandboxScreen() {
  const { parts, isPremium } = useStore();
  const canvasRef = useRef(null);
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (parts.length === 0) {
      Alert.alert('Empty Canvas', 'Add some parts to your contraption before saving!');
      return;
    }

    if (!isPremium && parts.length > 3) {
      Alert.alert(
        'Premium Feature',
        'Free users can only save contraptions with up to 3 parts. Upgrade to save unlimited parts.',
        [
          { text: 'Cancel' },
          { text: 'Upgrade', onPress: () => router.push('/premium') },
        ]
      );
      return;
    }

    setIsSaving(true);
    try {
      const contraption = {
        name: `Contraption ${new Date().toLocaleDateString()}`,
        parts,
        createdAt: new Date().toISOString(),
      };
      const id = await saveContraption(contraption);
      Alert.alert('Saved!', 'Your contraption has been saved to your gallery.');
      router.push(`/contraption/${id}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save contraption. Please try again.');
      console.error('Save error:', error);
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
