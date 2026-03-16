import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

interface AlertControlsProps {
  hapticEnabled: boolean;
  soundEnabled: boolean;
  onHapticToggle: (value: boolean) => void;
  onSoundToggle: (value: boolean) => void;
}

export const AlertControls: React.FC<AlertControlsProps> = ({
  hapticEnabled,
  soundEnabled,
  onHapticToggle,
  onSoundToggle,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.controlRow}>
        <Text style={styles.label}>Haptic Feedback</Text>
        <Switch
          value={hapticEnabled}
          onValueChange={onHapticToggle}
        />
      </View>
      <View style={styles.controlRow}>
        <Text style={styles.label}>Sound Alerts</Text>
        <Switch
          value={soundEnabled}
          onValueChange={onSoundToggle}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
  },
});
