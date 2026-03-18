import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore, ChildProfile } from '@/lib/store/useStore';
import { AgeProfileCard } from '@/components/AgeProfileCard';

type ProfileType = 'toddler' | 'kid' | 'teen' | 'adult';

interface ProfileFormData {
  name: string;
  age: string;
  profileType: ProfileType;
}

export default function ProfilesScreen() {
  const { profiles, addProfile, updateProfile, removeProfile } = useStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ChildProfile | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    age: '',
    profileType: 'kid',
  });

  const handleAddProfile = () => {
    setEditingProfile(null);
    setFormData({ name: '', age: '', profileType: 'kid' });
    setModalVisible(true);
  };

  const handleEditProfile = (profile: ChildProfile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      age: profile.age.toString(),
      profileType: profile.profileType,
    });
    setModalVisible(true);
  };

  const handleDeleteProfile = (profile: ChildProfile) => {
    Alert.alert(
      'Delete Profile',
      `Are you sure you want to delete ${profile.name}'s profile? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeProfile(profile.id);
            if (selectedProfileId === profile.id) {
              setSelectedProfileId(null);
            }
          },
        },
      ]
    );
  };

  const handleSaveProfile = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    const age = parseInt(formData.age, 10);
    if (isNaN(age) || age < 0 || age > 100) {
      Alert.alert('Error', 'Please enter a valid age (0-100)');
      return;
    }

    if (editingProfile) {
      updateProfile(editingProfile.id, {
        name: formData.name.trim(),
        age,
        profileType: formData.profileType,
      });
    } else {
      addProfile({
        name: formData.name.trim(),
        age,
        profileType: formData.profileType,
      });
    }

    setModalVisible(false);
    setFormData({ name: '', age: '', profileType: 'kid' });
    setEditingProfile(null);
  };

  const handleProfilePress = (profileId: string) => {
    setSelectedProfileId(selectedProfileId === profileId ? null : profileId);
  };

  const getBlockedContentForProfile = (profileId: string) => {
    const mockData = [
      { url: 'example-adult-site.com', reason: 'Adult content', timestamp: Date.now() - 3600000 },
      { url: 'gambling-site.com', reason: 'Gambling', timestamp: Date.now() - 7200000 },
      { url: 'violent-game.com', reason: 'Violence', timestamp: Date.now() - 86400000 },
      { url: 'social-media.com/mature', reason: 'Mature content', timestamp: Date.now() - 172800000 },
    ];
    return mockData;
  };

  const getRestrictionsForProfile = (profileType: ProfileType) => {
    const restrictions = {
      toddler: [
        'Whitelist-only browsing',
        'No social media access',
        'Educational content only',
        'No in-app purchases',
        'Supervised YouTube Kids only',
      ],
      kid: [
        'Adult content blocked',
        'Violence and gore blocked',
        'Gambling sites blocked',
        'Social media restricted',
        'Safe search enforced',
      ],
      teen: [
        'Extreme content blocked',
        'Gambling sites blocked',
        'Adult content filtered',
        'Social media allowed with monitoring',
        'Safe search recommended',
      ],
      adult: [
        'Minimal filtering',
        'User-defined blocks only',
        'Full internet access',
        'Optional content warnings',
      ],
    };
    return restrictions[profileType];
  };

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Profiles</Text>
          <Text style={styles.subtitle}>Manage child profiles and restrictions</Text>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddProfile}>
          <Ionicons name="add-circle" size={24} color="#007AFF" />
          <Text style={styles.addButtonText}>Add Profile</Text>
        </TouchableOpacity>

        {profiles.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyStateText}>No profiles yet</Text>
            <Text style={styles.emptyStateSubtext}>Tap "Add Profile" to create your first child profile</Text>
          </View>
        ) : (
          <View style={styles.profilesList}>
            {profiles.map((profile) => (
              <View key={profile.id} style={styles.profileItem}>
                <AgeProfileCard
                  name={profile.name}
                  age={profile.age}
                  profileType={profile.profileType}
                  onPress={() => handleProfilePress(profile.id)}
                />
                <View style={styles.profileActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditProfile(profile)}
                  >
                    <Ionicons name="create-outline" size={20} color="#007AFF" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteProfile(profile)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                  </TouchableOpacity>
                </View>

                {selectedProfileId === profile.id && (
                  <View style={styles.profileDetail}>
                    <View style={styles.detailSection}>
                      <Text style={styles.detailTitle}>Current Restrictions</Text>
                      {getRestrictionsForProfile(profile.profileType).map((restriction, index) => (
                        <View key={index} style={styles.restrictionItem}>
                          <Ionicons name="shield-checkmark" size={16} color="#34C759" />
                          <Text style={styles.restrictionText}>{restriction}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailTitle}>Recent Activity (Last 7 Days)</Text>
                      {getBlockedContentForProfile(profile.id).map((item, index) => (
                        <View key={index} style={styles.activityItem}>
                          <View style={styles.activityHeader}>
                            <Ionicons name="ban" size={16} color="#FF3B30" />
                            <Text style={styles.activityUrl}>{item.url}</Text>
                          </View>
                          <Text style={styles.activityReason}>{item.reason}</Text>
                          <Text style={styles.activityTime}>
                            {new Date(item.timestamp).toLocaleString()}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingProfile ? 'Edit Profile' : 'Add Profile'}
            </Text>
            <TouchableOpacity onPress={handleSaveProfile}>
              <Text style={styles.modalSaveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Name</Text>
              <TextInput
                style={styles.formInput}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter child's name"
                placeholderTextColor="#C7C7CC"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Age</Text>
              <TextInput
                style={styles.formInput}
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
                placeholder="Enter age"
                placeholderTextColor="#C7C7CC"
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Profile Type</Text>
              <View style={styles.profileTypeGrid}>
                {(['toddler', 'kid', 'teen', 'adult'] as ProfileType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.profileTypeButton,
                      formData.profileType === type && styles.profileTypeButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, profileType: type })}
                  >
                    <Text
                      style={[
                        styles.profileTypeButtonText,
                        formData.profileType === type && styles.profileTypeButtonTextActive,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Restrictions Preview</Text>
              <View style={styles.restrictionsPreview}>
                {getRestrictionsForProfile(formData.profileType).map((restriction, index) => (
                  <View key={index} style={styles.previewItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                    <Text style={styles.previewText}>{restriction}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  contentContainer: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 17,
    color: '#8E8E93',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
  },
  profilesList: {
    gap: 16,
  },
  profileItem: {
    gap: 8,
  },
  profileActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteButton: {
    backgroundColor: '#FFF5F5',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 6,
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
  profileDetail: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  detailSection: {
    gap: 12,
  },
  detailTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  restrictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  restrictionText: {
    fontSize: 15,
    color: '#000000',
    flex: 1,
  },
  activityItem: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityUrl: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
  },
  activityReason: {
    fontSize: 13,
    color: '#FF3B30',
    marginLeft: 24,
  },
  activityTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalCancelButton: {
    fontSize: 17,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  modalSaveButton: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 17,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  profileTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  profileTypeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  profileTypeButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#E5F2FF',
  },
  profileTypeButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
  },
  profileTypeButtonTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  restrictionsPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
});
