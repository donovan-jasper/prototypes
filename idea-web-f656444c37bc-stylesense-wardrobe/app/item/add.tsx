import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
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

const AVAILABLE_TAGS = [
  'casual',
  'formal',
  'work',
  'athletic',
  'everyday',
  'special',
  'summer',
  'winter',
  'spring',
  'fall',
];

export default function AddItemScreen() {
  const router = useRouter();
  const addItem = useWardrobeStore(state => state.addItem);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>('top');
  const [colors, setColors] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [classifying, setClassifying] = useState(false);
  const [saving, setSaving] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'StyleSync needs camera and photo library access to digitize your wardrobe.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handlePickImage = async (useCamera: boolean) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
      const classification = await classifyItem(uri);
      setCategory(classification.category);
      setColors(classification.colors);
      setTags(classification.tags);
    } catch (error) {
      Alert.alert('Classification Failed', 'Could not auto-classify item. Please set details manually.');
      console.error('Classification error:', error);
    } finally {
      setClassifying(false);
    }
  };

  const toggleTag = (tag: string) => {
    setTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (!imageUri) {
      Alert.alert('No Image', 'Please capture or select an image first.');
      return;
    }

    if (tags.length === 0) {
      Alert.alert('No Tags', 'Please select at least one tag for this item.');
      return;
    }

    setSaving(true);
    try {
      await addItem({
        imageUri,
        category,
        colors,
        tags,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
        addedDate: new Date().toISOString(),
      });

      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save item. Please try again.');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!imageUri ? (
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerTitle}>Add a clothing item</Text>
          <Text style={styles.pickerSubtitle}>
            Take a photo or choose from your gallery
          </Text>

          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => handlePickImage(true)}
          >
            <Ionicons name="camera" size={24} color="#007AFF" />
            <Text style={styles.pickerButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pickerButton, styles.pickerButtonSecondary]}
            onPress={() => handlePickImage(false)}
          >
            <Ionicons name="images" size={24} color="#007AFF" />
            <Text style={styles.pickerButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.imagePreview}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.changeImageButton}
              onPress={() => setImageUri(null)}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.changeImageText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {classifying && (
            <View style={styles.classifyingBanner}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.classifyingText}>Analyzing item...</Text>
            </View>
          )}

          <View style={styles.form}>
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

            <Text style={styles.label}>Detected Colors</Text>
            <View style={styles.colorPalette}>
              {colors.map((color, idx) => (
                <View
                  key={idx}
                  style={[styles.colorSwatch, { backgroundColor: color }]}
                />
              ))}
            </View>

            <Text style={styles.label}>Tags</Text>
            <View style={styles.tagsContainer}>
              {AVAILABLE_TAGS.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagChip,
                    tags.includes(tag) && styles.tagChipActive,
                  ]}
                  onPress={() => toggleTag(tag)}
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

            <Text style={styles.label}>Purchase Price (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="$0.00"
              keyboardType="decimal-pad"
              value={purchasePrice}
              onChangeText={setPurchasePrice}
            />

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Save Item</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
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
    paddingBottom: 40,
  },
  pickerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  pickerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  pickerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
    gap: 12,
  },
  pickerButtonSecondary: {
    backgroundColor: '#f3f4f6',
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  imagePreview: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  changeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  classifyingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f9ff',
    paddingVertical: 12,
    gap: 8,
  },
  classifyingText: {
    fontSize: 14,
    color: '#0369a1',
    fontWeight: '500',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    marginTop: 20,
  },
  categoryScroll: {
    marginBottom: 8,
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
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e5e7eb',
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
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 32,
    gap: 8,
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
