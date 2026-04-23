import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import SOSModal from '../app/sos';

const SOSButton = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.sosButton}
        onPress={toggleModal}
        activeOpacity={0.7}
        accessibilityLabel="Quick Relief SOS Button"
        accessibilityHint="Opens immediate pain relief options"
      >
        <View style={styles.sosIconContainer}>
          <MaterialIcons name="sos" size={32} color="#fff" />
        </View>
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>

      <SOSModal visible={isModalVisible} onClose={toggleModal} />
    </>
  );
};

const styles = StyleSheet.create({
  sosButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sosIconContainer: {
    transform: [{ rotate: '45deg' }],
    marginBottom: 2,
  },
  sosText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    transform: [{ rotate: '45deg' }],
    marginTop: 2,
  },
});

export default SOSButton;
