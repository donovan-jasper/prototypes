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

  const { control, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    const checkNetwork = async () => {
      const networkState = await Network.getNetworkStateAsync();
      setIsOffline(!networkState.isConnected);
    };

    checkNetwork();
    const interval = setInterval(checkNetwork, 30000);
    return () => clearInterval(interval);
  }, []);

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
            success: result.success || result.code === 0,
            error: result.error || result.message
          });

          completedPlatforms++;
          setPostingProgress(Math.round((completedPlatforms / totalPlatforms) * 100));
        } catch (error) {
          platformResults.push({
            platform,
            success: false,
            error: error.message || 'Failed to post to platform'
          });
        }
      }

      // Show results
      const successCount = platformResults.filter(r => r.success).length;
      setSnackbarMessage(`Posted to ${successCount}/${totalPlatforms} platforms`);
      setSnackbarVisible(true);

      // Reset form
      reset();
      setImageUri(null);

      // Navigate to inventory after successful post
      navigation.navigate('inventory');
    } catch (error) {
      console.error('Error posting product:', error);
      setSnackbarMessage('Failed to post product. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setIsPosting(false);
      setPostingProgress(0);
      setPostingPlatforms([]);
    }
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCapture = (uri) => {
    setImageUri(uri);
    setShowCamera(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Quick Post</Text>

      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.productImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonGroup}>
        <Button
          mode="outlined"
          onPress={() => setShowCamera(true)}
          icon="camera"
          style={styles.button}
        >
          Take Photo
        </Button>

        <Button
          mode="outlined"
          onPress={handleImagePick}
          icon="image"
          style={styles.button}
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
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!errors.title}
            style={styles.input}
          />
        )}
        name="title"
      />

      <Controller
        control={control}
        rules={{ required: 'Price is required' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Price"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="numeric"
            error={!!errors.price}
            style={styles.input}
          />
        )}
        name="price"
      />

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Description"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={3}
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
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="numeric"
            error={!!errors.inventory}
            style={styles.input}
          />
        )}
        name="inventory"
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

      {isPosting && (
        <View style={styles.progressContainer}>
          <ProgressBar progress={postingProgress / 100} color="#6200ee" />
          <Text style={styles.progressText}>
            Posting to {postingPlatforms.join(', ')}...
          </Text>
        </View>
      )}

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isPosting}
        disabled={isPosting}
        style={styles.postButton}
      >
        {isOffline ? 'Save for Later' : 'Post Everywhere'}
      </Button>

      {showCamera && (
        <CameraCapture
          onCapture={handleCapture}
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
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  productImage: {
    width: 200,
    height: 250,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: 200,
    height: 250,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  input: {
    marginBottom: 15,
  },
  postButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
  progressContainer: {
    marginVertical: 20,
  },
  progressText: {
    marginTop: 5,
    textAlign: 'center',
    color: '#666',
  },
});
