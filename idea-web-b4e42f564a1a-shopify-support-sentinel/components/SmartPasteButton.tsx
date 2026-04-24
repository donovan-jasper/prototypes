import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { parseTicketFromText } from '../lib/ticketParser';
import { ParsedTicket } from '../lib/types';

interface SmartPasteButtonProps {
  onParsed: (parsed: ParsedTicket) => void;
}

export default function SmartPasteButton({ onParsed }: SmartPasteButtonProps) {
  const handleSmartPaste = async () => {
    try {
      const clipboardText = await Clipboard.getStringAsync();

      if (!clipboardText) {
        Alert.alert('Clipboard empty', 'No text found in clipboard');
        return;
      }

      const parsed = parseTicketFromText(clipboardText);
      onParsed(parsed);

      // Show confirmation
      let message = 'Smart paste successful!\n';
      if (parsed.company) message += `Company: ${parsed.company.value}\n`;
      if (parsed.ticketId) message += `Ticket ID: ${parsed.ticketId.value}\n`;
      if (parsed.submittedAt) message += `Date: ${parsed.submittedAt.value.toLocaleDateString()}`;

      Alert.alert('Success', message);
    } catch (error) {
      Alert.alert('Error', 'Failed to parse clipboard content');
      console.error('Smart paste error:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleSmartPaste}>
      <Text style={styles.buttonText}>Smart Paste</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
