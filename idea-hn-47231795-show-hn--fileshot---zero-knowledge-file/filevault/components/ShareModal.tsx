import React from 'react';
import { View, StyleSheet, Modal, Share } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Colors } from '@/constants/Colors';

const ShareModal = ({ visible, onClose, link }) => {
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Here's a secure file share: ${link}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Share Link</Text>
          <Text style={styles.link}>{link}</Text>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleShare}
              style={styles.button}
            >
              Share
            </Button>
            <Button
              mode="outlined"
              onPress={onClose}
              style={styles.button}
            >
              Close
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.light.text,
  },
  link: {
    marginBottom: 20,
    color: Colors.light.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default ShareModal;
