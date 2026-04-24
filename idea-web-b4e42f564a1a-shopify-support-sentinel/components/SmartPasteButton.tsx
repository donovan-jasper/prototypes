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
      if (!parsed.company?.value && !parsed.ticketId?.value && !parsed.submittedAt?.value) {
        Alert.alert('No ticket info found', 'Could not extract ticket information from the pasted text');
        return;
      }

      onParsed(parsed);
      Alert.alert('Success', 'Ticket information extracted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to parse clipboard content');
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
