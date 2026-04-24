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
          processedImageUri = await addWatermark(processedImageUri, isPremium);

          const productWithImage = {
            ...product,
            imageUri: processedImageUri
          };

          let result;
          switch (platform) {
            case 'TikTok Shop':
              result = await retryTikTok(productWithImage, connectedPlatform.apiKey);
              break;
            case 'Instagram Shopping':
              result = await retryInstagram(productWithImage, connectedPlatform.apiKey, connectedPlatform.businessAccountId);
              break;
            case 'Facebook Marketplace':
              result = await retryFacebook(productWithImage, connectedPlatform.apiKey, connectedPlatform.pageId);
              break;
            default:
              continue;
          }

          platformResults.push({
            platform,
            success: true,
            message: 'Successfully posted'
          });

          completedPlatforms++;
          setPostingProgress(Math.round((completedPlatforms / totalPlatforms) * 100));
        } catch (error) {
          console.error(`Error posting to ${platform}:`, error);
          platformResults.push({
            platform,
            success: false,
            message: error.message || 'Failed to post'
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
      navigation.navigate('inventory');
    } catch (error) {
      console.error('Error posting product:', error);
      setSnackbarMessage('Failed to save product. Please try again.');
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
      </View>

      <View style={styles.buttonGroup}>
        <Button
          mode="outlined"
          onPress={() => setShowCamera(true)}
          icon="camera"
          style={styles.imageButton}
        >
          Take Photo
        </Button>
        <Button
          mode="outlined"
          onPress={handleImagePicker}
          icon="image"
          style={styles.imageButton}
        >
          Choose from Library
        </Button>
      </View>

      <Controller
        control={control}
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
        name="title"
      />
      {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

      <Controller
        control={control}
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
            mode="outlined"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            style={styles.input}
            keyboardType="numeric"
            error={!!errors.price}
          />
        )}
        name="price"
      />
      {errors.price && <Text style={styles.errorText}>{errors.price.message}</Text>}

      <Controller
        control={control}
        rules={{ required: 'Inventory is required' }}
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
        name="inventory"
      />
      {errors.inventory && <Text style={styles.errorText}>{errors.inventory.message}</Text>}

      <Controller
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Description"
            mode="outlined"
            onChangeText={onChange}
            value={value}
            style={[styles.input, styles.descriptionInput]}
            multiline
            numberOfLines={4}
          />
        )}
        name="description"
      />

      <Controller
        control={control}
        render={({ field: { onChange, value } }) => (
          <PlatformSelector
            selectedPlatforms={value || []}
            onChange={onChange}
            isPremium={isPremium}
          />
        )}
        name="platforms"
      />

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isPosting}
        disabled={isPosting}
        style={styles.postButton}
      >
        Post Everywhere
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
          <Dialog.Title>Upgrade Required</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Free users can only post to 2 platforms. Upgrade to Premium to post to all platforms.
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
            label: 'Dismiss',
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
    backgroundColor: '#fff',
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
    width: '100%',
    aspectRatio: 4/3,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  imageButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  input: {
    marginBottom: 16,
  },
  descriptionInput: {
    height: 100,
  },
  errorText: {
    color: 'red',
    marginTop: -12,
    marginBottom: 12,
    fontSize: 12,
  },
  postButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
  progressContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  progressText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressPercent: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
});
