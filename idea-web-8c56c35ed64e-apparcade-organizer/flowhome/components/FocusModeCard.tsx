import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useSettingsStore } from '@/store/settings';

interface FocusModeCardProps {
  mode: {
    id: string;
    name: string;
    isActive: boolean;
  };
}

export default function FocusModeCard({ mode }: FocusModeCardProps) {
  const theme = useSettingsStore((state) => state.theme);
  const toggleFocusMode = useSettingsStore((state) => state.toggleFocusMode);

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
      <Text style={[styles.name, { color: theme.text }]}>{mode.name}</Text>
      <Switch
        value={mode.isActive}
        onValueChange={() => toggleFocusMode(mode.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
  },
  name: {
    fontSize: 16,
  },
});
