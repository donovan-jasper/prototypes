import React, { useState, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import { useProductStore } from '../../store/products';
import Toast from 'react-native-toast-message';
import { openDatabase } from '../../lib/db';
import ImagePickerComponent from '../../components/ImagePicker';

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

  const handleImageSelected = (uri: string) => {
    setImageUri(uri);
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
      console.error('Error saving product:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save product. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Create New Product</Text>

        <ImagePickerComponent
          onImageSelected={handleImageSelected}
          initialImageUri={imageUri}
        />

        <View style={styles.formGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={[styles.input, errors.title ? styles.inputError : null]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter product title"
          />
          {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.description ? styles.inputError : null]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter product description"
            multiline
            numberOfLines={4}
          />
          {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Price ($)</Text>
            <TextInput
              style={[styles.input, errors.price ? styles.inputError : null]}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              keyboardType="numeric"
            />
            {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
          </View>

          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={[styles.input, errors.quantity ? styles.inputError : null]}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="0"
              keyboardType="numeric"
            />
            {errors.quantity ? <Text style={styles.errorText}>{errors.quantity}</Text> : null}
          </View>
        </View>

        {!isDraft && (
          <>
            <Text style={styles.sectionTitle}>Publish To Platforms</Text>
            {errors.platforms ? <Text style={styles.errorText}>{errors.platforms}</Text> : null}
            <View style={styles.platformsContainer}>
              {PLATFORMS.map((platform) => (
                <TouchableOpacity
                  key={platform}
                  style={[
                    styles.platformButton,
                    selectedPlatforms.includes(platform) ? styles.platformButtonSelected : null,
                  ]}
                  onPress={() => togglePlatform(platform)}
                >
                  <Text style={[
                    styles.platformButtonText,
                    selectedPlatforms.includes(platform) ? styles.platformButtonTextSelected : null,
                  ]}>
                    {platform}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.draftButton]}
            onPress={() => handleSubmit(true)}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>Save as Draft</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.publishButton]}
            onPress={() => handleSubmit(false)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Publish Now</Text>
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
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 15,
    color: '#333',
  },
  platformsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  platformButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 10,
  },
  platformButtonSelected: {
    backgroundColor: '#4CAF50',
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
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  draftButton: {
    backgroundColor: '#f0f0f0',
  },
  publishButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
