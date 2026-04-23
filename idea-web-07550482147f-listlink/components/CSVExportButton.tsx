import React from 'react';
import { Button, useTheme } from 'react-native-paper';
import { useSettingsStore } from '../lib/stores/settingsStore';

interface CSVExportButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function CSVExportButton({ onPress, disabled, loading }: CSVExportButtonProps) {
  const theme = useTheme();
  const { isPremium } = useSettingsStore();

  if (!isPremium) {
    return (
      <Button
        mode="outlined"
        onPress={() => {}}
        disabled
        style={{ opacity: 0.5 }}
      >
        Export CSV (Premium)
      </Button>
    );
  }

  return (
    <Button
      mode="contained"
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      icon="file-export"
    >
      Export CSV
    </Button>
  );
}
