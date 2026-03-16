import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('audiochain.db');

const ScannerScreen = ({ onClose }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    // Logic to add scanned product to build
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM components WHERE upc = ?',
        [data],
        (_, { rows: { _array } }) => {
          if (_array.length > 0) {
            // Add to current build
            console.log('Product found:', _array[0]);
          } else {
            alert('Product not found in database');
          }
        },
        (_, error) => console.log(error)
      );
    });
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <Button mode="contained" onPress={() => setScanned(false)} style={styles.button}>
          Tap to Scan Again
        </Button>
      )}
      <Button mode="contained" onPress={onClose} style={styles.button}>
        Close Scanner
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  button: {
    margin: 16,
  },
});

export default ScannerScreen;
