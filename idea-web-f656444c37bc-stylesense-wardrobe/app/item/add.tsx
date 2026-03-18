import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { classifyItem } from '@/lib/ai/itemClassifier';
import { Category } from '@/types';

const CATEGORIES: { label: string; value: Category }[] = [
  { label: 'Top', value: 'top' },
  { label: 'Bottom', value: 'bottom' },
  { label: 'Dress', value: 'dress' },
  { label: 'Outerwear', value: 'outerwear' },
  { label: 'Shoes', value: 'shoes' },
  { label: 'Accessory', value: 'accessory' },
];

const COMMON_TAGS = [
  'casual', 'formal', 'work', 'athletic', 'evening', 'summer', 'winter', 'everyday'
];

export default function AddItemScreen() {
  const router = useRouter();
  const { addItem } = useWardrobeStore();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>('top');
  const [colors, setColors] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [classifying, setClassifying] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera access is needed to capture photos of your clothing items.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        await classifyImage(uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
      console.error('Camera error:', error);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        await classifyImage(uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      console.error('Image picker error:', error);
    }
  };

  const classifyImage = async (uri: string) => {
    setClassifying(true);
    try {
      const result = await classifyItem(uri);
      setCategory(result.category);
      setColors(result.colors);
      setTags(result.tags);
    } catch (error) {
      console.error('Classification error:', error);
      Alert.alert('Classification Failed', 'Could not auto-detect item details. Please set them manually.');
    } finally {
      setClassifying(false);
    }
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleSave = async () => {
    if (!imageUri) {
      Alert.alert('Missing Image', 'Please capture or select an image first.');
      return;
    }

    if (tags.length === 0) {
      Alert.alert('Missing Tags', 'Please select at least one tag.');
      return;
    }

    setLoading(true);
    try {
      const price = purchasePrice ? parseFloat(purchasePrice) : undefined;
      
      await addItem({
        imageUri,
        category,
        colors,
        tags,
        purchasePrice: price,
        addedDate: new Date().toISOString(),
      });

      router.back();
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!imageUri ? (
        <View style={styles.captureSection}>
          <View style={styles.placeholder}>
            <Ionicons name="camera-outline" size={64} color="#9ca3af" />
            <Text style={styles.placeholderText}>Capture or select a photo</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto}>
              <Ionicons name="camera" size={24} color="#fff" />
              <Text style={styles.captureButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureButton} onPress={handlePickImage}>
              <Ionicons name="images" size={24} color="#fff" />
              <Text style={styles.captureButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.imagePreview}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.changeImageButton}
              onPress={() => setImageUri(null)}
            >
              <Ionicons name="close-circle" size={32} color="#fff" />
            </TouchableOpacity>
          </View>

          {classifying && (
            <View style={styles.classifyingBanner}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.classifyingText}>Analyzing image...</Text>
            </View>
          )}

          <View style={styles.formSection}>
            <Text style={styles.label}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryChip,
                    category === cat.value && styles.categoryChipActive,
                  ]}
                  onPress={() => setCategory(cat.value)}
                  disabled={classifying}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === cat.value && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Colors</Text>
            <View style={styles.colorPalette}>
              {colors.map((color, idx) => (
                <View
                  key={idx}
                  style={[styles.colorSwatch, { backgroundColor: color }]}
                />
              ))}
              {colors.length === 0 && (
                <Text style={styles.emptyText}>No colors detected</Text>
              )}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Tags</Text>
            <View style={styles.tagsContainer}>
              {COMMON_TAGS.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagChip,
                    tags.includes(tag) && styles.tagChipActive,
                  ]}
                  onPress={() => toggleTag(tag)}
                  disabled={classifying}
                >
                  <Text
                    style={[
                      styles.tagChipText,
                      tags.includes(tag) && styles.tagChipTextActive,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Purchase Price (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={purchasePrice}
              onChangeText={setPurchasePrice}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading || classifying}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Item</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  captureSection: {
    flex: 1,
    minHeight: 500,
    justifyContent: 'center',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 60,
    marginBottom: 24,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  buttonRow: {
    gap: 12,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 10,
    gap: 8,
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreview: {
    position: 'relative',
    marginBottom: 24,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  changeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
  },
  classifyingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  classifyingText: {
    fontSize: 14,
    color: '#0369a1',
    fontWeight: '500',
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tagChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  tagChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  tagChipTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
