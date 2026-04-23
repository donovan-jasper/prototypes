import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const colorScheme = useColorScheme();

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].errorBackground }]}>
      <Text style={[styles.message, { color: Colors[colorScheme ?? 'light'].errorText }]}>
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={styles.button}>
          <Text style={[styles.buttonText, { color: Colors[colorScheme ?? 'light'].tint }]}>
            Retry
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
    padding: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
