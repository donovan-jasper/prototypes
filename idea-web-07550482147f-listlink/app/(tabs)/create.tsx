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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useListingStore } from '../../lib/stores/listingStore';
import ImageUploader from '../../components/ImageUploader';

const PLATFORMS = [
  { id: 'ebay', name: 'eBay' },
  { id: 'poshmark', name: 'Poshmark' },
  { id: 'mercari', name: 'Mercari' },
  { id: 'depop', name: 'Depop' },
  { id: 'vinted', name: 'Vinted' },
  { id: 'etsy', name: 'Etsy' },
];

export default function CreateListingScreen() {
  const router = useRouter();
  const { addListing } = useListingStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [sourcingCost, setSourcingCost] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'active'>('draft');
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

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
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
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
    } finally {
      setSaving(false);
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
          <View style={styles.statusRow}>
            <TouchableOpacity
              style={[styles.statusButton, status === 'draft' && styles.statusButtonSelected]}
              onPress={() => setStatus('draft')}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  status === 'draft' && styles.statusButtonTextSelected,
                ]}
              >
                Draft
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusButton, status === 'active' && styles.statusButtonSelected]}
              onPress={() => setStatus('active')}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  status === 'active' && styles.statusButtonTextSelected,
                ]}
              >
                Active
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Listing'}
          </Text>
        </TouchableOpacity>
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
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
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
    color: '#333',
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  platformButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
  },
  platformButtonSelected: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  platformButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  platformButtonTextSelected: {
    color: '#fff',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
    alignItems: 'center',
  },
  statusButtonSelected: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  statusButtonTextSelected: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
