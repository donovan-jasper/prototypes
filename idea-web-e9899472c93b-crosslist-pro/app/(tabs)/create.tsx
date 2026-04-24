import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useProductStore } from '../../store/products';
import Toast from 'react-native-toast-message';

const PLATFORMS = ['Amazon', 'eBay', 'Shopify', 'Etsy'];

export default function CreateProduct() {
  const router = useRouter();
  const addProduct = useProductStore((state) => state.addProduct);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a product title');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a product description');
      return false;
    }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price');
      return false;
    }
    if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid quantity');
      return false;
    }
    if (!isDraft && selectedPlatforms.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one platform');
      return false;
    }
    return true;
  };

  const handleSubmit = async (asDraft: boolean = false) => {
    setIsDraft(asDraft);
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        quantity: parseInt(quantity),
        imageUri,
        platforms: asDraft ? [] : selectedPlatforms,
        isDraft: asDraft,
      };

      addProduct(productData);

      Toast.show({
        type: 'success',
        text1: asDraft ? 'Draft Saved' : 'Product Published',
        text2: asDraft
          ? 'Your product has been saved as a draft'
          : 'Your product has been successfully published',
        visibilityTime: 3000,
      });

      if (!asDraft) {
        setTitle('');
        setDescription('');
        setPrice('');
        setQuantity('');
        setImageUri(undefined);
        setSelectedPlatforms([]);
      }
      router.push('/(tabs)');
    } catch (error) {
      console.error('Product creation error:', error);
      Alert.alert('Error', 'Failed to create product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Photo</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePickerPlaceholder}>
                <Ionicons name="camera-outline" size={40} color="#007AFF" />
                <Text style={styles.imagePickerText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
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
            placeholderTextColor="#C7C7CC"
            multiline
            numberOfLines={4}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfWidth]}
              placeholder="Price"
              value={price}
              onChangeText={setPrice}
              placeholderTextColor="#C7C7CC"
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.halfWidth]}
              placeholder="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              placeholderTextColor="#C7C7CC"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Publish To</Text>
          <View style={styles.platformContainer}>
            {PLATFORMS.map((platform) => (
              <TouchableOpacity
                key={platform}
                style={[
                  styles.platformButton,
                  selectedPlatforms.includes(platform) && styles.platformButtonSelected,
                ]}
                onPress={() => togglePlatform(platform)}
              >
                <Text
                  style={[
                    styles.platformButtonText,
                    selectedPlatforms.includes(platform) && styles.platformButtonTextSelected,
                  ]}
                >
                  {platform}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.draftButton]}
            onPress={() => handleSubmit(true)}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>Save Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.publishButton]}
            onPress={() => handleSubmit(false)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Publish</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  imagePicker: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePickerPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerText: {
    color: '#007AFF',
    marginTop: 8,
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  platformContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  platformButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#e5e5ea',
    margin: 4,
  },
  platformButtonSelected: {
    backgroundColor: '#007AFF',
  },
  platformButtonText: {
    color: '#333',
    fontSize: 14,
  },
  platformButtonTextSelected: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  draftButton: {
    backgroundColor: '#e5e5ea',
  },
  publishButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
