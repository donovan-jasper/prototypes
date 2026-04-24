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
import { compressImage, formatImageForPlatform, addWatermark, saveImageToDevice } from '../../lib/utils/imageProcessor';
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
          processedImageUri = await addWatermark(processedImageUri);

          // Save processed image to device
          const savedImageUri = await saveImageToDevice(processedImageUri);
          product.imageUri = savedImageUri;

          // Update product with processed image
          await updateProduct(product);

          // Post to platform
          let result;
          switch (platform.toLowerCase()) {
            case 'tiktok':
              result = await postToTikTok(product, connectedPlatform.apiKey);
              break;
            case 'instagram':
              result = await postToInstagram(product, connectedPlatform.apiKey, connectedPlatform.businessAccountId);
              break;
            case 'facebook':
              result = await postToFacebook(product, connectedPlatform.apiKey, connectedPlatform.pageId);
              break;
            default:
              throw new Error(`Unsupported platform: ${platform}`);
          }

          platformResults.push({
            platform,
            success: true,
            message: result.message || 'Successfully posted'
          });

          completedPlatforms++;
          setPostingProgress(Math.round((completedPlatforms / totalPlatforms) * 100));
        } catch (error) {
          console.error(`Error posting to ${platform}:`, error);
          platformResults.push({
            platform,
            success: false,
            message: error.message || `Failed to post to ${platform}`
          });
        }
      }

      // Show results
      const successCount = platformResults.filter(r => r.success).length;
      setSnackbarMessage(`Posted to ${successCount} of ${totalPlatforms} platforms`);
      setSnackbarVisible(true);

      // Reset form
      reset();
      setImageUri(null);

      // Navigate to inventory
      navigation.navigate('inventory');
    } catch (error) {
      console.error('Error posting product:', error);
      setSnackbarMessage('Failed to post product. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setIsPosting(false);
      setPostingProgress(0);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Quick Post</Text>

      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.productImage} />
          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={() => setShowCamera(true)}
          >
            <Text style={styles.changeImageText}>Change Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.imagePlaceholder}>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => setShowCamera(true)}
          >
            <Text style={styles.cameraButtonText}>Take Photo</Text>
          </TouchableOpacity>
          <Text style={styles.orText}>or</Text>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={handleImagePicker}
          >
            <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.formContainer}>
        <Controller
          control={control}
          name="title"
          rules={{ required: 'Title is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Product Title"
              mode="outlined"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={styles.input}
              error={!!errors.title}
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
              label="Price"
              mode="outlined"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={styles.input}
              keyboardType="numeric"
              error={!!errors.price}
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
              mode="outlined"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={styles.input}
              keyboardType="numeric"
              error={!!errors.inventory}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Description"
              mode="outlined"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={[styles.input, styles.descriptionInput]}
              multiline
              numberOfLines={4}
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
        style={styles.postButton}
        loading={isPosting}
        disabled={isPosting}
      >
        {isPosting ? 'Posting...' : 'Post Everywhere'}
      </Button>

      {isPosting && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Posting to platforms...</Text>
          <ProgressBar progress={postingProgress / 100} style={styles.progressBar} />
          <Text style={styles.progressPercent}>{postingProgress}%</Text>
        </View>
      )}

      {showCamera && (
        <CameraCapture
          onCapture={handleImageCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      <Portal>
        <Dialog visible={showUpgradeDialog} onDismiss={() => setShowUpgradeDialog(false)}>
          <Dialog.Title>Upgrade to Premium</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              To post to more than 2 platforms, please upgrade to SyncSell Premium.
            </Paragraph>
            <Paragraph style={styles.dialogHighlight}>
              Unlimited platforms, scheduled posting, and more!
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
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  changeImageButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#6200ee',
    borderRadius: 4,
  },
  changeImageText: {
    color: 'white',
    fontWeight: 'bold',
  },
  imagePlaceholder: {
    height: 300,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cameraButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 4,
    marginBottom: 10,
  },
  cameraButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  orText: {
    marginVertical: 10,
    color: '#666',
  },
  galleryButton: {
    padding: 15,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#6200ee',
  },
  galleryButtonText: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'white',
  },
  descriptionInput: {
    height: 120,
  },
  postButton: {
    marginTop: 10,
    padding: 8,
  },
  progressContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  progressText: {
    marginBottom: 10,
    fontSize: 16,
    color: '#666',
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
  },
  progressPercent: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
  },
  dialogHighlight: {
    fontWeight: 'bold',
    marginTop: 10,
    color: '#6200ee',
  },
});
