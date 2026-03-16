import React, { useState } from 'react';
import { View, TextInput, Button, Modal, StyleSheet } from 'react-native';

interface ArgumentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, type: 'pro' | 'con') => void;
}

const ArgumentModal: React.FC<ArgumentModalProps> = ({ visible, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'pro' | 'con'>('pro');

  const handleSubmit = () => {
    onSubmit(title, type);
    setTitle('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.modal}>
          <TextInput
            style={styles.input}
            placeholder="Argument title"
            value={title}
            onChangeText={setTitle}
          />
          <View style={styles.buttonContainer}>
            <Button title="Pro" onPress={() => setType('pro')} />
            <Button title="Con" onPress={() => setType('con')} />
          </View>
          <Button title="Submit" onPress={handleSubmit} />
          <Button title="Cancel" onPress={onClose} />
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
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
});

export default ArgumentModal;
