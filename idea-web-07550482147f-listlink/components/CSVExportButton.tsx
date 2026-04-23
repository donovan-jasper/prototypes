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
      style={styles.button}
      icon="file-export"
    >
      Export CSV
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    marginLeft: 8,
  },
});
