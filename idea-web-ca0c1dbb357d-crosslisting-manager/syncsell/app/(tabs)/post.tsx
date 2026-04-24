import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { TextInput, Button, Snackbar, Portal, Dialog, Paragraph, ProgressBar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import CameraCapture from '../../components/CameraCapture';
import PlatformSelector from '../../components/PlatformSelector';
import { useProductStore } from '../../lib/store/useProductStore';
import { usePlatformStore } from '../../lib/store/usePlatformStore';
import { postProduct as postToTikTok, retryPostProduct as retryTikTok } from '../../lib/api/tiktok';
import { postProduct as postToInstagram, retryPostProduct as retryInstagram } from '../../lib/api/instagram';
import { postProduct as postToFacebook, retryPostProduct as retryFacebook } from '../../lib/api/facebook';
import { addProduct } from '../../lib/db';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { compressImage, formatImageForPlatform, addWatermark } from '../../lib/utils/imageProcessor';
import * as Network from 'expo-network';
import { useQueueStore } from '../../lib/store/useQueueStore';

export default function PostScreen() {
  const { addProduct: addToStore } = useProductStore();
  const { platforms } = usePlatformStore();
  const { isPremium } = useAuthStore();
  const { addToQueue, processQueue } = useQueueStore();
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [postingProgress, setPostingProgress] = useState(0);
  const [postingPlatforms, setPostingPlatforms] = useState([]);
  const [isOffline, setIsOffline] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  useEffect(() => {
    const checkNetwork = async () => {
      const networkState = await Network.getNetworkStateAsync();
      setIsOffline(!networkState.isConnected);
    };

    checkNetwork();
    const interval = setInterval(checkNetwork, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleImageCapture = (uri) => {
    setImageUri(uri);
    setShowCamera(false);
  };

  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Please enable camera roll permissions in your device settings');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      const compressedUri = await compressImage(result.assets[0].uri);
      setImageUri(compressedUri);
    }
  };

  const onSubmit = async (data) => {
    if (!imageUri) {
      setSnackbarMessage('Please add a product image');
      setSnackbarVisible(true);
      return;
    }

    if (!data.platforms || data.platforms.length === 0) {
      setSnackbarMessage('Please select at least one platform');
      setSnackbarVisible(true);
      return;
    }

    if (!isPremium && data.platforms.length > 2) {
      setShowUpgradeDialog(true);
      return;
    }

    setIsPosting(true);
    setPostingProgress(0);
    setPostingPlatforms(data.platforms);

    const product = {
      ...data,
      imageUri,
      platforms: data.platforms || [],
      createdAt: new Date().toISOString(),
    };

    try {
      // Save to local database first
      const productId = await addProduct(product);
      product.id = productId;
      addToStore(product);

      if (isOffline) {
        // Queue for offline posting
        await addToQueue({
          productId,
          platforms: data.platforms,
          timestamp: new Date().toISOString()
        });
        setSnackbarMessage('Product saved. Will post when online.');
        setSnackbarVisible(true);
        reset();
        setImageUri(null);
        navigation.navigate('inventory');
        return;
      }

      // Process platforms
      const platformResults = [];
      const totalPlatforms = data.platforms.length;
      let completedPlatforms = 0;

      for (const platform of data.platforms) {
        const connectedPlatform = platforms.find(p => p.name === platform);
        if (!connectedPlatform) continue;

        try {
          // Process image for platform
          let processedImageUri = await compressImage(imageUri);
          processedImageUri = await formatImageForPlatform(processedImageUri, platform);
          if (!isPremium) {
            processedImageUri = await addWatermark(processedImageUri);
          }

          // Update product with processed image
          const platformProduct = { ...product, imageUri: processedImageUri };

          // Post to platform
          let result;
          switch (platform) {
            case 'TikTok':
              result = await postToTikTok(platformProduct, connectedPlatform.apiKey);
              break;
            case 'Instagram':
              result = await postToInstagram(platformProduct, connectedPlatform.apiKey, connectedPlatform.businessAccountId);
              break;
            case 'Facebook':
              result = await postToFacebook(platformProduct, connectedPlatform.apiKey, connectedPlatform.pageId);
              break;
            default:
              throw new Error(`Unsupported platform: ${platform}`);
          }

          platformResults.push({ platform, success: true, result });
        } catch (error) {
          console.error(`Error posting to ${platform}:`, error);
          platformResults.push({ platform, success: false, error: error.message });
        }

        completedPlatforms++;
        setPostingProgress((completedPlatforms / totalPlatforms) * 100);
      }

      // Show results
      const successfulPosts = platformResults.filter(r => r.success).length;
      const failedPosts = platformResults.filter(r => !r.success).length;

      if (successfulPosts > 0) {
        setSnackbarMessage(`Posted to ${successfulPosts} platform${successfulPosts > 1 ? 's' : ''}`);
      }

      if (failedPosts > 0) {
        Alert.alert(
          'Partial Success',
          `${successfulPosts} platform${successfulPosts > 1 ? 's' : ''} succeeded, ${failedPosts} failed.`,
          [{ text: 'OK' }]
        );
      }

      // Reset form
      reset();
      setImageUri(null);
      navigation.navigate('inventory');
    } catch (error) {
      console.error('Error posting product:', error);
      setSnackbarMessage('Failed to post product. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Quick Post</Text>

      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.productImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}

        <View style={styles.imageButtons}>
          <Button
            mode="contained"
            onPress={() => setShowCamera(true)}
            style={styles.imageButton}
            icon="camera"
          >
            Take Photo
          </Button>

          <Button
            mode="outlined"
            onPress={handleImagePicker}
            style={styles.imageButton}
            icon="image"
          >
            Choose from Library
          </Button>
        </View>
      </View>

      <View style={styles.formContainer}>
        <Controller
          control={control}
          name="title"
          rules={{ required: 'Title is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Product Title"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!errors.title}
              style={styles.input}
            />
          )}
        />

        <Controller
          control={control}
          name="price"
          rules={{
            required: 'Price is required',
            pattern: {
              value: /^\d+(\.\d{1,2})?$/,
              message: 'Please enter a valid price'
            }
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Price ($)"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="numeric"
              error={!!errors.price}
              style={styles.input}
            />
          )}
        />

        <Controller
          control={control}
          name="inventory"
          rules={{
            required: 'Inventory is required',
            pattern: {
              value: /^\d+$/,
              message: 'Please enter a valid number'
            }
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Inventory Count"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="numeric"
              error={!!errors.inventory}
              style={styles.input}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Description"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={3}
              style={[styles.input, styles.textArea]}
            />
          )}
        />

        <Controller
          control={control}
          name="platforms"
          rules={{ required: 'Please select at least one platform' }}
          render={({ field: { onChange, value } }) => (
            <PlatformSelector
              selectedPlatforms={value || []}
              onSelect={onChange}
              error={!!errors.platforms}
            />
          )}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isPosting}
        disabled={isPosting}
        style={styles.postButton}
        icon="send"
      >
        Post Everywhere
      </Button>

      {isPosting && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Posting to {postingPlatforms.join(', ')}...
          </Text>
          <ProgressBar progress={postingProgress / 100} style={styles.progressBar} />
        </View>
      )}

      {showCamera && (
        <CameraCapture
          onCapture={handleImageCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          {snackbarMessage}
        </Snackbar>

        <Dialog visible={showUpgradeDialog} onDismiss={() => setShowUpgradeDialog(false)}>
          <Dialog.Title>Upgrade Required</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              You can only post to 2 platforms on the free tier. Upgrade to post to all selected platforms.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowUpgradeDialog(false)}>Cancel</Button>
            <Button onPress={() => {
              setShowUpgradeDialog(false);
              navigation.navigate('settings');
            }}>Upgrade</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  imageContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    color: '#757575',
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  imageButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  formContainer: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
  },
  postButton: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  progressContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  progressText: {
    marginBottom: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
});
