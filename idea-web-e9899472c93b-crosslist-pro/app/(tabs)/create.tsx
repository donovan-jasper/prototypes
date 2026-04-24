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
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useProductStore } from '../../store/products';
import Toast from 'react-native-toast-message';
import { openDatabase } from '../../lib/db';

const PLATFORMS = ['Amazon', 'eBay', 'Shopify', 'Etsy'];

export default function CreateProduct() {
  const router = useRouter();
  const addProduct = useProductStore((state) => state.addProduct);
  const db = openDatabase();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    price: '',
    quantity: '',
    platforms: '',
  });

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
    setErrors(prev => ({ ...prev, platforms: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors = {
      title: '',
      description: '',
      price: '',
      quantity: '',
      platforms: '',
    };
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Product title is required';
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = 'Product description is required';
      isValid = false;
    }

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      newErrors.price = 'Please enter a valid price';
      isValid = false;
    }

    if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
      isValid = false;
    }

    if (!isDraft && selectedPlatforms.length === 0) {
      newErrors.platforms = 'Please select at least one platform';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
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

      // Save to Zustand store
      addProduct(productData);

      // Save to SQLite database
      await db.transactionAsync(async (tx) => {
        await tx.executeSqlAsync(
          'INSERT INTO products (title, description, price, quantity, imageUri, platforms, isDraft, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            productData.title,
            productData.description,
            productData.price,
            productData.quantity,
            productData.imageUri || '',
            JSON.stringify(productData.platforms),
            productData.isDraft ? 1 : 0,
            new Date().toISOString(),
          ]
        );
      });

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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="Enter product title"
              value={title}
              onChangeText={setTitle}
              onBlur={() => {
                if (!title.trim()) {
                  setErrors(prev => ({ ...prev, title: 'Product title is required' }));
                } else {
                  setErrors(prev => ({ ...prev, title: '' }));
                }
              }}
            />
            {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.description && styles.inputError]}
              placeholder="Enter product description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              onBlur={() => {
                if (!description.trim()) {
                  setErrors(prev => ({ ...prev, description: 'Product description is required' }));
                } else {
                  setErrors(prev => ({ ...prev, description: '' }));
                }
              }}
            />
            {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Price ($)</Text>
              <TextInput
                style={[styles.input, errors.price && styles.inputError]}
                placeholder="0.00"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                onBlur={() => {
                  if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
                    setErrors(prev => ({ ...prev, price: 'Please enter a valid price' }));
                  } else {
                    setErrors(prev => ({ ...prev, price: '' }));
                  }
                }}
              />
              {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={[styles.input, errors.quantity && styles.inputError]}
                placeholder="0"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                onBlur={() => {
                  if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
                    setErrors(prev => ({ ...prev, quantity: 'Please enter a valid quantity' }));
                  } else {
                    setErrors(prev => ({ ...prev, quantity: '' }));
                  }
                }}
              />
              {errors.quantity ? <Text style={styles.errorText}>{errors.quantity}</Text> : null}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platforms</Text>
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
          {errors.platforms ? <Text style={styles.errorText}>{errors.platforms}</Text> : null}
        </View>

        <View style={styles.section}>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Save as Draft</Text>
            <Switch
              value={isDraft}
              onValueChange={setIsDraft}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isDraft ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.draftButton]}
            onPress={() => handleSubmit(true)}
            disabled={isSubmitting}
          >
            {isSubmitting && isDraft ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save Draft</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.publishButton]}
            onPress={() => handleSubmit(false)}
            disabled={isSubmitting}
          >
            {isSubmitting && !isDraft ? (
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
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
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
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePickerPlaceholder: {
    alignItems: 'center',
  },
  imagePickerText: {
    color: '#007AFF',
    marginTop: 8,
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff3b30',
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
    marginBottom: 8,
  },
  platformButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    marginRight: 8,
    marginBottom: 8,
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
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  draftButton: {
    backgroundColor: '#6c757d',
  },
  publishButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
  },
});
