import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { TextInput, Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import CameraCapture from '../../components/CameraCapture';
import PlatformSelector from '../../components/PlatformSelector';
import { useProductStore } from '../../lib/store/useProductStore';

export default function PostScreen() {
  const { addProduct } = useProductStore();
  const [imageUri, setImageUri] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    const product = {
      ...data,
      imageUri,
      platforms: data.platforms || [],
      createdAt: new Date().toISOString(),
    };
    addProduct(product);
    // Post to platforms
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImageUri(result.uri);
    }
  };

  return (
    <View style={styles.container}>
      {showCamera ? (
        <CameraCapture onCapture={(uri) => {
          setImageUri(uri);
          setShowCamera(false);
        }} />
      ) : (
        <>
          <TouchableOpacity onPress={() => setShowCamera(true)} style={styles.cameraButton}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <Text style={styles.cameraButtonText}>Take Photo</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleImagePick} style={styles.galleryButton}>
            <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>
          <Controller
            control={control}
            rules={{ required: 'Title is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Title"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.title}
                style={styles.input}
              />
            )}
            name="title"
          />
          {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
          <Controller
            control={control}
            rules={{ required: 'Price is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Price"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="numeric"
                error={!!errors.price}
                style={styles.input}
              />
            )}
            name="price"
          />
          {errors.price && <Text style={styles.errorText}>{errors.price.message}</Text>}
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Description"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                multiline
                style={styles.input}
              />
            )}
            name="description"
          />
          <Controller
            control={control}
            rules={{ required: 'Inventory is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Inventory"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="numeric"
                error={!!errors.inventory}
                style={styles.input}
              />
            )}
            name="inventory"
          />
          {errors.inventory && <Text style={styles.errorText}>{errors.inventory.message}</Text>}
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <PlatformSelector
                selectedPlatforms={value}
                onSelectPlatforms={onChange}
              />
            )}
            name="platforms"
          />
          <Button mode="contained" onPress={handleSubmit(onSubmit)} style={styles.postButton}>
            Post Everywhere
          </Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  cameraButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cameraButtonText: {
    fontSize: 18,
    color: '#666',
  },
  galleryButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  galleryButtonText: {
    fontSize: 16,
    color: '#666',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
  postButton: {
    marginTop: 16,
  },
});
