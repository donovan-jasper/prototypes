import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

interface CSVExportButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function CSVExportButton({ onPress, disabled, loading }: CSVExportButtonProps) {
  const theme = useTheme();

  return (
    <Button
      mode="contained"
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      icon="file-export"
      style={styles.button}
      contentStyle={styles.buttonContent}
    >
      Export CSV
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 4,
  },
  buttonContent: {
    height: 40,
  },
});
