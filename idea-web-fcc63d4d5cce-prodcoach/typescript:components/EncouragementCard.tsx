import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type EncouragementCardProps = {
  message: string;
};

export default function EncouragementCard({ message }: EncouragementCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4ecdc4',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});
