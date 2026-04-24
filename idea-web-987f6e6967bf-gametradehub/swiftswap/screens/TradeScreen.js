import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';

const TradeScreen = ({ navigation }) => {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const inventoryRef = ref(database, 'inventory');
    onValue(inventoryRef, (snapshot) => {
      const data = snapshot.val();
      const items = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setInventory(items);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text>Inventory</Text>
      {inventory.map(item => (
        <Text key={item.id}>{item.barcode}</Text>
      ))}
      <Button title="Go to Inventory" onPress={() => navigation.navigate('Inventory')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TradeScreen;
