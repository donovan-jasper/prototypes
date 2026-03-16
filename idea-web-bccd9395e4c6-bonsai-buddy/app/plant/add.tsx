import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { usePlants } from '../../hooks/usePlants';

export default function AddPlantScreen() {
  const router = useRouter();
  const { addPlant } = usePlants();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [wateringFrequency, setWateringFrequency] = useState('7');
  const [photoUri, setPhotoUri] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    await addPlant({
      name,
      species,
      wateringFrequency: parseInt(wateringFrequency),
      photoUri,
    });
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <TextInput
          label="Plant Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          label="Species"
          value={species}
          onChangeText={setSpecies}
          style={styles.input}
        />
        <TextInput
          label="Watering Frequency (days)"
          value={wateringFrequency}
          onChangeText={setWateringFrequency}
          keyboardType="numeric"
          style={styles.input}
        />
        <Button mode="outlined" onPress={pickImage} style={styles.button}>
          Pick Image
        </Button>
        <Button mode="contained" onPress={handleSave} style={styles.button}>
          Save Plant
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});
