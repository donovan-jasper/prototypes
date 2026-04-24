import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { parseTicketFromText } from '../lib/ticketParser';
import { ParsedTicket } from '../lib/types';

interface SmartPasteButtonProps {
  onParsed: (parsed: ParsedTicket) => void;
}

export default function SmartPasteButton({ onParsed }: SmartPasteButtonProps) {
  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();

      if (!text) {
        Alert.alert('Clipboard empty', 'No text found in clipboard');
        return;
      }

      const parsed = parseTicketFromText(text);
      onParsed(parsed);

      // Show confirmation
      let message = 'Pasted content analyzed:\n';
      if (parsed.company) message += `Company: ${parsed.company.value}\n`;
      if (parsed.ticketId) message += `Ticket ID: ${parsed.ticketId.value}\n`;
      if (parsed.submittedAt) message += `Date: ${parsed.submittedAt.value.toLocaleDateString()}\n`;

      if (message === 'Pasted content analyzed:\n') {
        message = 'No ticket information found in pasted text';
      }

      Alert.alert('Smart Paste', message);
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
