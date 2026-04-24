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

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
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
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: 'There was an error saving your product. Please try again.',
        visibilityTime: 4000,
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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create New Product</Text>
        </View>

        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={40} color="#999" />
                <Text style={styles.imagePlaceholderText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="Product title"
              value={title}
              onChangeText={setTitle}
              onBlur={() => {
                if (!title.trim()) {
                  setErrors(prev => ({ ...prev, title: 'Product title is required' }));
                }
              }}
            />
            {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.description && styles.inputError]}
              placeholder="Product description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              onBlur={() => {
                if (!description.trim()) {
                  setErrors(prev => ({ ...prev, description: 'Product description is required' }));
                }
              }}
            />
            {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, styles.halfWidth]}>
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
                  }
                }}
              />
              {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
            </View>

            <View style={[styles.formGroup, styles.halfWidth]}>
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
                  }
                }}
              />
              {errors.quantity ? <Text style={styles.errorText}>{errors.quantity}</Text> : null}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Publish to Platforms</Text>
            <View style={styles.platformsContainer}>
              {PLATFORMS.map((platform) => (
                <TouchableOpacity
                  key={platform}
                  style={[
                    styles.platformButton,
                    selectedPlatforms.includes(platform) && styles.platformButtonSelected
                  ]}
                  onPress={() => togglePlatform(platform)}
                >
                  <Text style={[
                    styles.platformButtonText,
                    selectedPlatforms.includes(platform) && styles.platformButtonTextSelected
                  ]}>
                    {platform}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.platforms ? <Text style={styles.errorText}>{errors.platforms}</Text> : null}
          </View>

          <View style={styles.actions}>
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
                <Text style={styles.buttonText}>Publish</Text>
              )}
            </TouchableOpacity>
          </View>
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
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePicker: {
    width: 200,
    height: 200,
    borderRadius: 10,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#495057',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#dc3545',
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
  platformsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  platformButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    marginRight: 8,
    marginBottom: 8,
  },
  platformButtonSelected: {
    backgroundColor: '#0d6efd',
  },
  platformButtonText: {
    color: '#495057',
    fontSize: 14,
  },
  platformButtonTextSelected: {
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  draftButton: {
    backgroundColor: '#6c757d',
  },
  publishButton: {
    backgroundColor: '#0d6efd',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 5,
  },
});
