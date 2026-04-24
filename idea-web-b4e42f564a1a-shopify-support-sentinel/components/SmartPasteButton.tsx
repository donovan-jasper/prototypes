import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, Clipboard } from 'react-native';
import { parseTicketFromText } from '../lib/ticketParser';
import { ParsedTicket } from '../lib/types';

interface SmartPasteButtonProps {
  onParsed: (parsed: ParsedTicket) => void;
}

export default function SmartPasteButton({ onParsed }: SmartPasteButtonProps) {
  const handlePaste = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      if (!clipboardContent) {
        Alert.alert('Clipboard empty', 'No text found in clipboard');
        return;
      }

      const parsed = parseTicketFromText(clipboardContent);
      if (!parsed.company && !parsed.ticketId && !parsed.submittedAt) {
        Alert.alert('No data found', 'Could not extract ticket information from the clipboard content');
        return;
      }

      onParsed(parsed);
      Alert.alert('Success', 'Ticket information extracted from clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to read clipboard');
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePaste}>
      <Text style={styles.buttonText}>Smart Paste</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
