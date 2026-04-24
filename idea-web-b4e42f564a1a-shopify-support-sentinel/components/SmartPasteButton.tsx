import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, Clipboard } from 'react-native';
import { parseTicketFromText } from '../lib/ticketParser';

interface SmartPasteButtonProps {
  onParsed: (parsed: ParsedTicket) => void;
}

export default function SmartPasteButton({ onParsed }: SmartPasteButtonProps) {
  const handlePress = async () => {
    try {
      const clipboardText = await Clipboard.getString();
      if (!clipboardText) {
        Alert.alert('Clipboard is empty', 'Please copy text from an email or support page first');
        return;
      }

      const parsed = parseTicketFromText(clipboardText);
      onParsed(parsed);
      Alert.alert('Smart Paste', 'Ticket information extracted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to parse clipboard content');
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
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
