import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import QRPairingModal from '../../components/QRPairingModal';

export default function Settings() {
  const [modalVisible, setModalVisible] = React.useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Pairing</Text>
      <Button title="Pair New Device" onPress={() => setModalVisible(true)} />
      <QRPairingModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      <Text style={styles.sectionTitle}>Sync</Text>
      <Button title="Manual Sync" onPress={() => {}} />
      <Text style={styles.sectionTitle}>Premium</Text>
      <Button title="Upgrade" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
});
