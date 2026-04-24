import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { database } from '../firebase';
import { ref, push, set } from 'firebase/database';

const InventoryScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [gameTitle, setGameTitle] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    try {
      // In a real app, we would call IGDB API here to get game details
      // For now, we'll simulate it with a mock response
      const mockGameData = {
        '123456789012': { title: 'The Legend of Zelda: Breath of the Wild', price: 59.99 },
        '987654321098': { title: 'Super Mario Odyssey', price: 39.99 },
        '555555555555': { title: 'Elden Ring', price: 29.99 }
      };

      const gameData = mockGameData[data] || { title: 'Unknown Game', price: 0 };

      // Save to Firebase
      const inventoryRef = ref(database, 'inventory');
      const newItemRef = push(inventoryRef);
      await set(newItemRef, {
        barcode: data,
        title: gameData.title,
        purchasePrice: gameData.price,
        timestamp: Date.now()
      });

      Alert.alert('Success', `Added ${gameData.title} to inventory`);
    } catch (error) {
      console.error('Error processing scan:', error);
      Alert.alert('Error', 'Failed to process scan');
    }
  };

  const handleManualAdd = async () => {
    if (!gameTitle || !purchasePrice) {
      Alert.alert('Error', 'Please enter both game title and purchase price');
      return;
    }

    try {
      const inventoryRef = ref(database, 'inventory');
      const newItemRef = push(inventoryRef);
      await set(newItemRef, {
        title: gameTitle,
        purchasePrice: parseFloat(purchasePrice),
        timestamp: Date.now()
      });

      Alert.alert('Success', `Added ${gameTitle} to inventory`);
      setGameTitle('');
      setPurchasePrice('');
      setManualEntry(false);
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item');
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {!manualEntry ? (
        <>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
          {scanned && (
            <Button
              title={'Tap to Scan Again'}
              onPress={() => setScanned(false)}
            />
          )}
          <View style={styles.buttonContainer}>
            <Button
              title="Manual Entry"
              onPress={() => setManualEntry(true)}
            />
            <Button
              title="Go to Trade"
              onPress={() => navigation.navigate('Trade')}
            />
          </View>
        </>
      ) : (
        <View style={styles.manualEntryContainer}>
          <Text style={styles.header}>Add Game Manually</Text>
          <TextInput
            style={styles.input}
            placeholder="Game Title"
            value={gameTitle}
            onChangeText={setGameTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Purchase Price ($)"
            value={purchasePrice}
            onChangeText={setPurchasePrice}
            keyboardType="numeric"
          />
          <View style={styles.buttonContainer}>
            <Button
              title="Add Game"
              onPress={handleManualAdd}
            />
            <Button
              title="Cancel"
              onPress={() => setManualEntry(false)}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  manualEntryContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});

export default InventoryScreen;
