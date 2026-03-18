import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useProductStore } from '../../store/products';

const PLATFORMS = ['Amazon', 'eBay', 'Shopify', 'Etsy'];

export default function CreateProduct() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const addProduct = useProductStore((state) => state.addProduct);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library access to select images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera access to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const validateForm = (): string | null => {
    if (!title.trim()) return 'Please enter a product title';
    if (!description.trim()) return 'Please enter a description';
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return 'Please enter a valid price';
    }
    if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      return 'Please enter a valid quantity';
    }
    if (selectedPlatforms.length === 0) {
      return 'Please select at least one platform';
    }
    return null;
  };

  const handleCreate = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    addProduct({
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      quantity: parseInt(quantity),
      imageUri,
      platforms: selectedPlatforms,
    });

    // Clear form
    setTitle('');
    setDescription('');
    setPrice('');
    setQuantity('');
    setImageUri(undefined);
    setSelectedPlatforms([]);
    setIsLoading(false);

    // Show success message
    setSuccessMessage('Product created successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {successMessage ? (
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product Image</Text>
        <View style={styles.imageSection}>
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setImageUri(undefined)}
              >
                <Ionicons name="close-circle" size={28} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={48} color="#C7C7CC" />
              <Text style={styles.imagePlaceholderText}>No image selected</Text>
            </View>
          )}
          <View style={styles.imageButtons}>
            <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={24} color="#007AFF" />
              <Text style={styles.imageButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Ionicons name="images-outline" size={24} color="#007AFF" />
              <Text style={styles.imageButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product Details</Text>
        <TextInput
          style={styles.input}
          placeholder="Product Title"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#C7C7CC"
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholderTextColor="#C7C7CC"
        />
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Price</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholderTextColor="#C7C7CC"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              placeholderTextColor="#C7C7CC"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Platforms</Text>
        <View style={styles.platformGrid}>
          {PLATFORMS.map((platform) => {
            const isSelected = selectedPlatforms.includes(platform);
            return (
              <TouchableOpacity
                key={platform}
                style={[
                  styles.platformCheckbox,
                  isSelected && styles.platformCheckboxSelected,
                ]}
                onPress={() => togglePlatform(platform)}
              >
                <View
                  style={[
                    styles.checkbox,
                    isSelected && styles.checkboxSelected,
                  ]}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text
                  style={[
                    styles.platformLabel,
                    isSelected && styles.platformLabelSelected,
                  ]}
                >
                  {platform}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.createButton, isLoading && styles.createButtonDisabled]}
        onPress={handleCreate}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Create Product</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  successBanner: {
    backgroundColor: '#E8F8EC',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  successText: {
    fontSize: 16,
    color: '#34C759',
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  imageSection: {
    alignItems: 'center',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  imageButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 8,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  platformCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    minWidth: '47%',
  },
  platformCheckboxSelected: {
    backgroundColor: '#E5F3FF',
    borderColor: '#007AFF',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  platformLabel: {
    fontSize: 16,
    color: '#000000',
  },
  platformLabelSelected: {
    fontWeight: '600',
    color: '#007AFF',
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
