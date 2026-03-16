import React, { useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useStore } from '../../lib/store';
import Canvas from '../../components/Canvas';
import PartPalette from '../../components/PartPalette';
import PlaybackControls from '../../components/PlaybackControls';
import TutorialOverlay from '../../components/TutorialOverlay';

export default function SandboxScreen() {
  const { isPlaying, isPremium, selectedTutorial } = useStore();
  const canvasRef = useRef(null);
  const [showTutorial, setShowTutorial] = useState(!!selectedTutorial);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  return (
    <View style={styles.container}>
      <Canvas ref={canvasRef} />
      <PartPalette />
      <PlaybackControls canvasRef={canvasRef} />
      {showTutorial && selectedTutorial && (
        <TutorialOverlay
          tutorial={selectedTutorial}
          onComplete={handleTutorialComplete}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
