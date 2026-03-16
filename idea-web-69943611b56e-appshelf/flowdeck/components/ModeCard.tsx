import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useStore } from '../store/appStore';

const ModeCard = ({ mode }) => {
  const { setActiveMode } = useStore();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: mode.color }]}
      onPress={() => setActiveMode(mode)}
    >
      <Text style={styles.name}>{mode.name}</Text>
      <Text style={styles.appCount}>{mode.appIds.length} apps</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  appCount: {
    color: 'white',
    marginTop: 4,
  },
});

export default ModeCard;
