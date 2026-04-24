import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { parseTicketFromText } from '../lib/ticketParser';
import { ParsedTicket } from '../lib/types';

interface SmartPasteButtonProps {
  onParsed: (parsed: ParsedTicket) => void;
}

export default function SmartPasteButton({ onParsed }: SmartPasteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    setIsLoading(true);
    try {
      const clipboardText = await Clipboard.getStringAsync();

      if (!clipboardText.trim()) {
        Alert.alert('Clipboard is empty', 'Please copy some text first');
        return;
      }

      const parsed = parseTicketFromText(clipboardText);
      onParsed(parsed);
    } catch (error) {
      Alert.alert('Error', 'Failed to parse clipboard content');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>Smart Paste</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
