import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { TensionStatus } from '@/types';
import { Colors } from '@/constants/colors';

interface TensionButtonProps {
  status: TensionStatus;
  onPress: () => void;
  lastLogTime?: number;
}

export default function TensionButton({ status, onPress, lastLogTime }: TensionButtonProps) {
  const isTense = status === 'tense';
  const backgroundColor = isTense ? Colors.light.tense : Colors.light.relaxed;
  const label = isTense ? 'Tense' : 'Relaxed';

  const formatLastLogTime = () => {
    if (!lastLogTime) return null;
    const now = Date.now();
    const diff = now - lastLogTime;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `Last logged ${hours}h ago`;
    } else if (minutes > 0) {
      return `Last logged ${minutes}m ago`;
    } else {
      return 'Just logged';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        testID="tension-button"
        style={[styles.button, { backgroundColor }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
      {lastLogTime && (
        <Text style={styles.lastLog}>{formatLastLogTime()}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  label: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  lastLog: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.light.icon,
  },
});
