import React from 'react';
import { View, Text, Modal, Button, StyleSheet } from 'react-native';

const TranscriptModal = ({ visible, onClose, transcript }) => {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Transcript</Text>
        <Text style={styles.transcript}>{transcript}</Text>
        <Button title="Close" onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  transcript: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default TranscriptModal;
