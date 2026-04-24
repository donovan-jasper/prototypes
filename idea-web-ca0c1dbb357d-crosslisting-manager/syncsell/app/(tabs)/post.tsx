import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { TextInput, Button, Snackbar, Portal, Dialog, Paragraph } from 'react-native-paper';
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

export default function PostScreen() {
  const { addProduct: addToStore } = useProductStore();
  const { platforms } = usePlatformStore();
  const { isPremium } = useAuthStore();
  const [imageUri, setImageUri] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [postingProgress, setPostingProgress] = useState(0);
  const [postingPlatforms, setPostingPlatforms] = useState([]);

  const { control, handleSubmit, formState: { errors }, reset } = useForm();

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
      addProduct(product, (productId) => {
        product.id = productId;
        addToStore(product);
      });

      // Post to selected platforms
      const platformResults = [];
      const totalPlatforms = data.platforms.length;
      let completedPlatforms = 0;

      for (const platform of data.platforms) {
        const connectedPlatform = platforms.find(p => p.name === platform);
        if (!connectedPlatform) continue;

        try {
          let result;
          switch (platform) {
            case 'TikTok Shop':
              result = await retryTikTok(product, connectedPlatform.apiKey);
              break;
            case 'Instagram Shopping':
              result = await retryInstagram(product, connectedPlatform.apiKey, connectedPlatform.businessAccountId);
              break;
            case 'Facebook Marketplace':
              result = await retryFacebook(product, connectedPlatform.apiKey, connectedPlatform.pageId);
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
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImageUri(result.uri);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {showCamera ? (
        <CameraCapture onCapture={(uri) => {
          setImageUri(uri);
          setShowCamera(false);
        }} />
      ) : (
        <>
          <TouchableOpacity onPress={() => setShowCamera(true)} style={styles.cameraButton}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <Text style={styles.cameraButtonText}>Take Photo</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleImagePick} style={styles.galleryButton}>
            <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>

          <Controller
            control={control}
            rules={{ required: 'Title is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Title"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.title}
                style={styles.input}
              />
            )}
            name="title"
          />
          {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

          <Controller
            control={control}
            rules={{ required: 'Price is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Price"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="numeric"
                error={!!errors.price}
                style={styles.input}
              />
            )}
            name="price"
          />
          {errors.price && <Text style={styles.errorText}>{errors.price.message}</Text>}

          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Description"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                multiline
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
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="numeric"
                error={!!errors.inventory}
                style={styles.input}
              />
            )}
            name="inventory"
          />
          {errors.inventory && <Text style={styles.errorText}>{errors.inventory.message}</Text>}

          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <PlatformSelector
                selectedPlatforms={value}
                onSelectPlatforms={onChange}
                isPremium={isPremium}
              />
            )}
            name="platforms"
          />

          {isPosting && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>Posting to {postingPlatforms.join(', ')}...</Text>
              <ActivityIndicator size="large" color="#6200ee" />
              <Text style={styles.progressPercentage}>{postingProgress}%</Text>
            </View>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.postButton}
            disabled={isPosting}
            loading={isPosting}
          >
            {isPosting ? 'Posting...' : 'Post Everywhere'}
          </Button>

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
                  You can only post to 2 platforms on the free tier. Upgrade to premium to post to all selected platforms.
                </Paragraph>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setShowUpgradeDialog(false)}>Cancel</Button>
                <Button onPress={() => {
                  setShowUpgradeDialog(false);
                  // Navigate to upgrade screen
                }}>Upgrade</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  cameraButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cameraButtonText: {
    fontSize: 18,
    color: '#666',
  },
  galleryButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  galleryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
  postButton: {
    marginTop: 16,
    padding: 8,
  },
  progressContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  progressText: {
    marginBottom: 10,
    fontSize: 16,
  },
  progressPercentage: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
