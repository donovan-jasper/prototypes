import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useListingStore } from '../../lib/stores/listingStore';
import ImageUploader from '../../components/ImageUploader';
import { Ionicons } from '@expo/vector-icons';

const PLATFORMS = [
  { id: 'ebay', name: 'eBay', icon: 'logo-ebay' },
  { id: 'poshmark', name: 'Poshmark', icon: 'logo-pinterest' },
  { id: 'mercari', name: 'Mercari', icon: 'logo-google' },
  { id: 'depop', name: 'Depop', icon: 'logo-instagram' },
  { id: 'vinted', name: 'Vinted', icon: 'logo-twitter' },
  { id: 'etsy', name: 'Etsy', icon: 'logo-etsy' },
];

export default function CreateListingScreen() {
  const router = useRouter();
  const { addListing, loading } = useListingStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [sourcingCost, setSourcingCost] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'active'>('draft');
  const [images, setImages] = useState<string[]>([]);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title is required');
      return false;
    }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert('Validation Error', 'Valid price is required');
      return false;
    }
    if (selectedPlatforms.length === 0) {
      Alert.alert('Validation Error', 'Select at least one platform');
      return false;
    }
    if (images.length === 0) {
      Alert.alert('Validation Error', 'At least one image is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      await addListing({
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        sourcingCost: sourcingCost ? parseFloat(sourcingCost) : 0,
        platform: selectedPlatforms.join(','),
        status,
        images: JSON.stringify(images),
      });

      Alert.alert('Success', 'Listing created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create listing');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <ImageUploader images={images} onImagesChange={setImages} />

        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Vintage Nike Windbreaker"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your item..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Price *</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Sourcing Cost</Text>
            <TextInput
              style={styles.input}
              value={sourcingCost}
              onChangeText={setSourcingCost}
              placeholder="0.00"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Platforms *</Text>
          <View style={styles.platformGrid}>
            {PLATFORMS.map(platform => (
              <TouchableOpacity
                key={platform.id}
                style={[
                  styles.platformButton,
                  selectedPlatforms.includes(platform.id) && styles.platformButtonSelected,
                ]}
                onPress={() => togglePlatform(platform.id)}
              >
                <Ionicons
                  name={platform.icon}
                  size={20}
                  color={selectedPlatforms.includes(platform.id) ? '#fff' : '#666'}
                />
                <Text
                  style={[
                    styles.platformButtonText,
                    selectedPlatforms.includes(platform.id) && styles.platformButtonTextSelected,
                  ]}
                >
                  {platform.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusToggle}>
            <TouchableOpacity
              style={[
                styles.statusButton,
                status === 'draft' && styles.statusButtonActive,
              ]}
              onPress={() => setStatus('draft')}
            >
              <Text style={[
                styles.statusButtonText,
                status === 'draft' && styles.statusButtonTextActive,
              ]}>Draft</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statusButton,
                status === 'active' && styles.statusButtonActive,
              ]}
              onPress={() => setStatus('active')}
            >
              <Text style={[
                styles.statusButtonText,
                status === 'active' && styles.statusButtonTextActive,
              ]}>Publish</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save Listing</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  platformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  platformButtonSelected: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  platformButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  platformButtonTextSelected: {
    color: '#fff',
  },
  statusToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#4285F4',
  },
  statusButtonText: {
    fontSize: 16,
    color: '#666',
  },
  statusButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#4285F4',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#333',
  },
});
