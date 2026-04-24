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
import { useNavigation } from '@react-navigation/native';

export default function PostScreen() {
  const { addProduct: addToStore } = useProductStore();
  const { platforms } = usePlatformStore();
  const { isPremium } = useAuthStore();
  const navigation = useNavigation();
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
      const productId = await addProduct(product);
      product.id = productId;
      addToStore(product);

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
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImageUri(result.uri);
    }
  };

  const handleCameraCapture = (uri) => {
    setImageUri(uri);
    setShowCamera(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Quick Post</Text>
        <Text style={styles.subtitle}>Sell everywhere in seconds</Text>
      </View>

      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.productImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}
        <View style={styles.imageButtons}>
          <Button
            mode="outlined"
            onPress={() => setShowCamera(true)}
            style={styles.imageButton}
            icon="camera"
          >
            Take Photo
          </Button>
          <Button
            mode="outlined"
            onPress={handleImagePick}
            style={styles.imageButton}
            icon="image"
          >
            Choose Photo
          </Button>
        </View>
      </View>

      <View style={styles.form}>
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
              label="Description (optional)"
              mode="outlined"
              onChangeText={onChange}
              value={value}
              style={styles.input}
              multiline
              numberOfLines={3}
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
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        style={styles.postButton}
        loading={isPosting}
        disabled={isPosting}
      >
        {isPosting ? `Posting (${postingProgress}%)` : 'Post Everywhere'}
      </Button>

      {isPosting && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Posting to:</Text>
          {postingPlatforms.map((platform, index) => (
            <Text key={index} style={styles.platformText}>
              • {platform}
            </Text>
          ))}
        </View>
      )}

      <Portal>
        <Dialog visible={showUpgradeDialog} onDismiss={() => setShowUpgradeDialog(false)}>
          <Dialog.Title>Upgrade Required</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              You've selected {postingPlatforms.length} platforms. Free users can only post to 2 platforms.
            </Paragraph>
            <Paragraph style={styles.dialogText}>
              Upgrade to Premium to post to unlimited platforms and get more features.
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

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>

      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
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
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  imageContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  imageButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  form: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    marginTop: -8,
    marginBottom: 8,
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
    fontWeight: 'bold',
    marginBottom: 8,
  },
  platformText: {
    marginLeft: 8,
    marginTop: 4,
  },
  dialogText: {
    marginTop: 16,
  },
});
