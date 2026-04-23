import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, IconButton } from 'react-native-paper';

interface CSVExportButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function CSVExportButton({ onPress, disabled, loading }: CSVExportButtonProps) {
  return (
    <IconButton
      icon="file-export"
      size={24}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      style={styles.button}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    marginLeft: 8,
  },
});
