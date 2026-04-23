import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface CSVExportButtonProps {
  onPress: () => void;
  isExporting: boolean;
  isPremium: boolean;
}

export function CSVExportButton({ onPress, isExporting, isPremium }: CSVExportButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={isExporting || !isPremium}
    >
      {isExporting ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          <MaterialIcons name="file-download" size={18} color="#fff" style={styles.icon} />
          <Text style={styles.text}>Export CSV</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    opacity: 0.8,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
