import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getListing } from '../../lib/database';
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

const PLATFORM_COLORS: Record<string, string> = {
  ebay: '#E53238',
  poshmark: '#630A34',
  mercari: '#3F51B5',
  depop: '#FF0000',
  vinted: '#09B1BA',
  etsy: '#F1641E',
};

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { updateListing, deleteListing } = useListingStore();

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [sourcingCost, setSourcingCost] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'active' | 'sold' | 'expired'>('draft');
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      const data = await getListing(id as string);
      if (data) {
        setListing(data);
        setTitle(data.title);
        setDescription(data.description || '');
        setPrice(data.price.toString());
        setSourcingCost(data.sourcingCost?.toString() || '0');
        setSelectedPlatforms(data.platform.split(','));
        setStatus(data.status);
        setImages(data.images ? JSON.parse(data.images) : []);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteListing(id as string);
              Alert.alert('Success', 'Listing deleted', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete listing');
            }
          },
        },
      ]
    );
  };

  const handleMarkAsSold = async () => {
    try {
      await updateListing(id as string, { status: 'sold' });
      await loadListing();
      Alert.alert('Success', 'Listing marked as sold');
    } catch (error) {
      Alert.alert('Error', 'Failed to update listing');
    }
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(pid => pid !== platformId)
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

  const handleSaveEdit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      await updateListing(id as string, {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        sourcingCost: sourcingCost ? parseFloat(sourcingCost) : 0,
        platform: selectedPlatforms.join(','),
        status,
        images: JSON.stringify(images),
      });

      await loadListing();
      setIsEditing(false);
      Alert.alert('Success', 'Listing updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Listing not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isEditing) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.editContent}>
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
            <View style={styles.statusGrid}>
              {(['draft', 'active', 'sold', 'expired'] as const).map((statusOption) => (
                <TouchableOpacity
                  key={statusOption}
                  style={[
                    styles.statusButton,
                    status === statusOption && styles.statusButtonSelected,
                  ]}
                  onPress={() => setStatus(statusOption)}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      status === statusOption && styles.statusButtonTextSelected,
                    ]}
                  >
                    {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                setIsEditing(false);
                loadListing();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSaveEdit}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  const listingImages = images.length > 0 ? images : [];
  const platforms = listing.platform.split(',');

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {listingImages.length > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageGallery}
          >
            {listingImages.map((uri: string, index: number) => (
              <Image key={index} source={{ uri }} style={styles.galleryImage} resizeMode="cover" />
            ))}
          </ScrollView>
        )}

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{listing.title}</Text>
            <Text style={styles.price}>${listing.price.toFixed(2)}</Text>
          </View>

          <View style={styles.platformsRow}>
            {platforms.map((platform: string) => {
              const platformColor = PLATFORM_COLORS[platform.toLowerCase()] || '#666';
              return (
                <View key={platform} style={[styles.platformBadge, { backgroundColor: platformColor }]}>
                  <Text style={styles.platformBadgeText}>{platform.toUpperCase()}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, getStatusStyle(listing.status)]}>
              <Text style={styles.statusBadgeText}>{listing.status.toUpperCase()}</Text>
            </View>
          </View>

          {listing.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{listing.description}</Text>
            </View>
          )}

          {listing.sourcingCost > 0 && (
            <View style={styles.costSection}>
              <Text style={styles.sectionTitle}>Cost Details</Text>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Sourcing Cost:</Text>
                <Text style={styles.costValue}>${listing.sourcingCost.toFixed(2)}</Text>
              </View>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Potential Profit:</Text>
                <Text style={[styles.costValue, styles.profitValue]}>
                  ${(listing.price - listing.sourcingCost).toFixed(2)}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>

            {listing.status !== 'sold' && (
              <TouchableOpacity style={styles.soldButton} onPress={handleMarkAsSold}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.soldButtonText}>Mark as Sold</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'active':
      return { backgroundColor: '#4CAF50' };
    case 'sold':
      return { backgroundColor: '#2196F3' };
    case 'draft':
      return { backgroundColor: '#9E9E9E' };
    case 'expired':
      return { backgroundColor: '#FF9800' };
    default:
      return { backgroundColor: '#666' };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  imageGallery: {
    height: 300,
    backgroundColor: '#f5f5f5',
  },
  galleryImage: {
    width: 400,
    height: 300,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E7D32',
  },
  platformsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  platformBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  platformBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  statusContainer: {
    marginBottom: 24,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  costSection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  costLabel: {
    fontSize: 16,
    color: '#666',
  },
  costValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  profitValue: {
    color: '#2E7D32',
  },
  actionsSection: {
    gap: 12,
  },
  editButton: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  soldButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  soldButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#E53238',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editContent: {
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
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
  },
  statusButtonSelected: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  statusButtonTextSelected: {
    color: '#fff',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2E7D32',
  },
  saveButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
