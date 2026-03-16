import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Picker } from 'react-native';
import { useMediaStore } from '../../store/mediaStore';
import BarcodeScanner from '../../components/BarcodeScanner';

const AddScreen = () => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('book');
  const [showScanner, setShowScanner] = useState(false);
  const { addMedia } = useMediaStore();

  const handleAddMedia = () => {
    addMedia({
      id: Date.now().toString(),
      title,
      type,
      currentProgress: 0,
      totalProgress: 100,
      unit: 'percentage',
      lastUpdated: new Date(),
    });
    setTitle('');
  };

  return (
    <View style={styles.container}>
      {showScanner ? (
        <BarcodeScanner onClose={() => setShowScanner(false)} />
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter media title"
            value={title}
            onChangeText={setTitle}
          />
          <Picker
            selectedValue={type}
            style={styles.picker}
            onValueChange={(itemValue) => setType(itemValue)}
          >
            <Picker.Item label="Book" value="book" />
            <Picker.Item label="Audiobook" value="audiobook" />
            <Picker.Item label="Movie" value="movie" />
            <Picker.Item label="TV Show" value="tv" />
            <Picker.Item label="Podcast" value="podcast" />
          </Picker>
          <Button title="Add Media" onPress={handleAddMedia} />
          <Button title="Scan Barcode" onPress={() => setShowScanner(true)} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 16,
  },
});

export default AddScreen;
