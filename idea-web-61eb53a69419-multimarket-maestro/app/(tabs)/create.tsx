import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, Checkbox, Snackbar, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../../store/app-store';
import { Platform } from '../../types';
import { router } from 'expo-router';

const platformInfo: Record<Platform, { label: string; color: string }> = {
  ebay: { label: 'eBay', color: '#E53238' },
  etsy: { label: 'Etsy', color: '#F1641E' },
  depop: { label: 'Depop', color: '#FF0000' },
  poshmark: { label: 'Poshmark', color: '#630F3E' },
  facebook: { label: 'Facebook Marketplace', color: '#1877F2' },
};

export default function CreateScreen() {
  const { addListing } = useAppStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [images, setImages] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to add images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...newImages].slice(0, 10));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
    if (errors.platforms) {
      setErrors(prev => ({ ...prev, platforms: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    const priceNum = parseFloat(price);
    if (!price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    const quantityNum = parseInt(quantity);
    if (!quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(quantityNum) || quantityNum < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    if (images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    if (selectedPlatforms.length === 0) {
      newErrors.platforms = 'Select at least one platform';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = async () => {
    if (!validate()) {
      setSnackbarMessage('Please fix the errors before publishing');
      setSnackbarVisible(true);
      return;
    }

    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    addListing({
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      quantity: parseInt(quantity),
      images,
      platforms: selectedPlatforms,
      syncStatus: 'pending',
    });

    setIsSubmitting(false);
    setSnackbarMessage('Listing created successfully!');
    setSnackbarVisible(true);

    setTimeout(() => {
      router.back();
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            mode="outlined"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
            }}
            placeholder="Enter listing title"
            error={!!errors.title}
            style={styles.input}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            mode="outlined"
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
            }}
            placeholder="Describe your item"
            multiline
            numberOfLines={4}
            error={!!errors.description}
            style={[styles.input, styles.textArea]}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        <View style={styles.row}>
          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Price ($) *</Text>
            <TextInput
              mode="outlined"
              value={price}
              onChangeText={(text) => {
                setPrice(text);
                if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
              }}
              placeholder="0.00"
              keyboardType="decimal-pad"
              error={!!errors.price}
              style={styles.input}
            />
            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
          </View>

          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Quantity *</Text>
            <TextInput
              mode="outlined"
              value={quantity}
              onChangeText={(text) => {
                setQuantity(text);
                if (errors.quantity) setErrors(prev => ({ ...prev, quantity: '' }));
              }}
              placeholder="1"
              keyboardType="number-pad"
              error={!!errors.quantity}
              style={styles.input}
            />
            {errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Images * (up to 10)</Text>
          <Button
            mode="outlined"
            onPress={pickImages}
            icon="camera"
            style={styles.imageButton}
          >
            Add Images ({images.length}/10)
          </Button>
          {errors.images && <Text style={styles.errorText}>{errors.images}</Text>}
          
          {images.length > 0 && (
            <ScrollView horizontal style={styles.imagesContainer} showsHorizontalScrollIndicator={false}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Platforms * (select where to list)</Text>
          {errors.platforms && <Text style={styles.errorText}>{errors.platforms}</Text>}
          
          {(Object.keys(platformInfo) as Platform[]).map((platform) => {
            const info = platformInfo[platform];
            const isSelected = selectedPlatforms.includes(platform);
            
            return (
              <TouchableOpacity
                key={platform}
                style={[
                  styles.platformItem,
                  isSelected && styles.platformItemSelected,
                ]}
                onPress={() => togglePlatform(platform)}
                activeOpacity={0.7}
              >
                <View style={styles.platformLeft}>
                  <View style={[styles.platformIcon, { backgroundColor: info.color }]} />
                  <Text style={styles.platformLabel}>{info.label}</Text>
                </View>
                <Checkbox.Android
                  status={isSelected ? 'checked' : 'unchecked'}
                  onPress={() => togglePlatform(platform)}
                  color={info.color}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handlePublish}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.publishButton}
          contentStyle={styles.publishButtonContent}
        >
          {isSubmitting ? 'Publishing...' : 'Publish Listing'}
        </Button>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  imageButton: {
    marginBottom: 12,
  },
  imagesContainer: {
    marginTop: 8,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  platformItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  platformItemSelected: {
    borderColor: '#1976D2',
    backgroundColor: '#E3F2FD',
  },
  platformLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  platformLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  bottomPadding: {
    height: 80,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  publishButton: {
    borderRadius: 8,
  },
  publishButtonContent: {
    paddingVertical: 8,
  },
});
