import React from 'react';
import { View, Text, Image, Button, StyleSheet } from 'react-native';
import CloudBadge from './CloudBadge';

const DuplicateCard = ({ duplicates, onKeep, onDismiss }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Duplicate Detected</Text>
      <View style={styles.imagesContainer}>
        {duplicates.map((item) => (
          <View key={item.id} style={styles.imageContainer}>
            <Image source={{ uri: item.localPath }} style={styles.image} />
            <CloudBadge service={item.source} style={styles.badge} />
          </View>
        ))}
      </View>
      <View style={styles.buttonsContainer}>
        <Button title="Keep All" onPress={() => onDismiss()} />
        {duplicates.map((item) => (
          <Button key={item.id} title={`Keep ${item.source}`} onPress={() => onKeep(item.id)} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageContainer: {
    flex: 1,
    margin: 5,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default DuplicateCard;
