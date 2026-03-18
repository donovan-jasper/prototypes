import React, { useState } from 'react';
import { View, TextInput, Button, Modal, StyleSheet, Text } from 'react-native';
import { DebateNode } from '../utils/debateTree';

interface ArgumentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, type: 'pro' | 'con') => void;
  parentNode?: DebateNode;
}

const ArgumentModal: React.FC<ArgumentModalProps> = ({ visible, onClose, onSubmit, parentNode }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'pro' | 'con'>('pro');

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit(title, type);
      setTitle('');
      setType('pro');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.modal}>
          {parentNode && (
            <View style={styles.parentInfo}>
              <Text style={styles.parentLabel}>Replying to:</Text>
              <Text style={styles.parentTitle}>{parentNode.title}</Text>
            </View>
          )}
          
          <TextInput
            style={styles.input}
            placeholder="Enter your argument"
            value={title}
            onChangeText={setTitle}
            multiline
          />
          
          <View style={styles.typeSelector}>
            <Text style={styles.typeLabel}>Argument type:</Text>
            <View style={styles.buttonContainer}>
              <View style={styles.typeButton}>
                <Button 
                  title="Pro" 
                  onPress={() => setType('pro')}
                  color={type === 'pro' ? '#2e7d32' : '#999'}
                />
              </View>
              <View style={styles.typeButton}>
                <Button 
                  title="Con" 
                  onPress={() => setType('con')}
                  color={type === 'con' ? '#c62828' : '#999'}
                />
              </View>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <View style={styles.actionButton}>
              <Button title="Submit" onPress={handleSubmit} />
            </View>
            <View style={styles.actionButton}>
              <Button title="Cancel" onPress={onClose} color="#666" />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    width: '85%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  parentInfo: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  parentLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  parentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    marginBottom: 16,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default ArgumentModal;
