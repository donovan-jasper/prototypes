import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Modal } from 'react-native';
import { resolveConflict } from '../lib/sync';

interface ConflictResolverProps {
  messageId: string;
  localText: string;
  remoteText: string;
  visible: boolean;
  onClose: () => void;
}

export default function ConflictResolver({ messageId, localText, remoteText, visible, onClose }: ConflictResolverProps) {
  const [resolvedText, setResolvedText] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      const success = await resolveConflict(messageId, resolvedText || localText);
      if (success) {
        onClose();
      }
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Message Conflict Detected</Text>

          <Text style={styles.sectionTitle}>Your Version:</Text>
          <Text style={styles.textContent}>{localText}</Text>

          <Text style={styles.sectionTitle}>Server Version:</Text>
          <Text style={styles.textContent}>{remoteText}</Text>

          <Text style={styles.sectionTitle}>Resolve Conflict:</Text>
          <TextInput
            style={styles.input}
            multiline
            value={resolvedText}
            onChangeText={setResolvedText}
            placeholder="Edit to resolve conflict..."
          />

          <View style={styles.buttonContainer}>
            <Button
              title="Use Local"
              onPress={() => handleResolve()}
              disabled={isResolving}
            />
            <Button
              title="Use Remote"
              onPress={() => {
                setResolvedText(remoteText);
                handleResolve();
              }}
              disabled={isResolving}
            />
            <Button
              title="Custom"
              onPress={handleResolve}
              disabled={isResolving || !resolvedText}
            />
          </View>

          <Button
            title="Cancel"
            onPress={onClose}
            disabled={isResolving}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  textContent: {
    fontSize: 14,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  input: {
    fontSize: 14,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    minHeight: 80,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
});
