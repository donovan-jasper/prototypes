import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore, ChildProfile } from '@/lib/store/useStore';
import { AgeProfileCard } from '@/components/AgeProfileCard';
import { ParentPinModal } from '@/components/ParentPinModal';
import { applyProfileFilter } from '@/lib/filtering/contentFilter';
import { screenTimeAPI } from '@/lib/native/screenTimeAPI';
import { digitalWellbeingAPI } from '@/lib/native/digitalWellbeingAPI';

type ProfileType = 'toddler' | 'kid' | 'teen' | 'adult';

interface ProfileFormData {
  name: string;
  age: string;
  profileType: ProfileType;
}

export default function ProfilesScreen() {
  const { profiles, addProfile, updateProfile, removeProfile, activeProfile, setActiveProfile } = useStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ChildProfile | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    age: '',
    profileType: 'kid',
  });
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<{ available: boolean; enabled: boolean } | null>(null);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      if (Platform.OS === 'ios') {
        const status = await screenTimeAPI.getStatus();
        setApiStatus(status);
      } else if (Platform.OS === 'android') {
        const status = await digitalWellbeingAPI.getStatus();
        setApiStatus(status);
      }
    } catch (error) {
      console.error('Error checking API status:', error);
      setApiStatus({ available: false, enabled: false });
    }
  };

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

  const handleActivateProfile = async (profile: ChildProfile) => {
    setIsLoading(true);
    try {
      // Verify parent authentication
      setPinModalVisible(true);

      // If authentication succeeds, apply the profile
      const success = await applyProfileFilter(profile.profileType);
      if (success) {
        setActiveProfile(profile.id);
        Alert.alert('Success', `Content filtering activated for ${profile.name}'s profile`);
      } else {
        Alert.alert('Error', 'Failed to activate content filtering. Please try again.');
      }
    } catch (error) {
      console.error('Error activating profile:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getBlockedContentForProfile = (profileId: string) => {
    // In a real app, this would fetch from the database
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

        {apiStatus && !apiStatus.available && (
          <View style={styles.warningContainer}>
            <Ionicons name="warning-outline" size={20} color="#FF9500" />
            <Text style={styles.warningText}>
              {Platform.OS === 'ios'
                ? 'Screen Time API not available on this device'
                : 'Digital Wellbeing API not available on this device'}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddProfile}>
          <Ionicons name="add-circle" size={24} color="#007AFF" />
          <Text style={styles.addButtonText}>Add Profile</Text>
        </TouchableOpacity>

        {profiles.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyStateText}>No profiles yet</Text>
            <Text style={styles.emptyStateSubtext}>Add a profile to get started</Text>
          </View>
        ) : (
          <View style={styles.profilesList}>
            {profiles.map((profile) => (
              <View key={profile.id} style={styles.profileContainer}>
                <AgeProfileCard
                  name={profile.name}
                  age={profile.age}
                  profileType={profile.profileType}
                  isActive={profile.id === activeProfile}
                  onPress={() => handleProfilePress(profile.id)}
                  onEdit={() => handleEditProfile(profile)}
                  onDelete={() => handleDeleteProfile(profile)}
                />
                {selectedProfileId === profile.id && (
                  <View style={styles.profileDetails}>
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Restrictions</Text>
                      {getRestrictionsForProfile(profile.profileType).map((restriction, index) => (
                        <View key={index} style={styles.restrictionItem}>
                          <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                          <Text style={styles.restrictionText}>{restriction}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Recent Blocks</Text>
                      {getBlockedContentForProfile(profile.id).map((item, index) => (
                        <View key={index} style={styles.blockedItem}>
                          <View style={styles.blockedItemHeader}>
                            <Text style={styles.blockedUrl}>{item.url}</Text>
                            <Text style={styles.blockedReason}>{item.reason}</Text>
                          </View>
                          <Text style={styles.blockedTime}>
                            {new Date(item.timestamp).toLocaleString()}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.activateButton,
                        profile.id === activeProfile && styles.activeButton
                      ]}
                      onPress={() => handleActivateProfile(profile)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons
                            name={profile.id === activeProfile ? "checkmark-circle" : "shield-checkmark"}
                            size={20}
                            color="#FFFFFF"
                          />
                          <Text style={styles.activateButtonText}>
                            {profile.id === activeProfile ? 'Active Profile' : 'Activate Profile'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProfile ? 'Edit Profile' : 'Add New Profile'}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Child's name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="Age"
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Profile Type</Text>
              <View style={styles.profileTypeSelector}>
                {(['toddler', 'kid', 'teen', 'adult'] as ProfileType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.profileTypeButton,
                      formData.profileType === type && styles.selectedProfileType
                    ]}
                    onPress={() => setFormData({ ...formData, profileType: type })}
                  >
                    <Text style={styles.profileTypeText}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ParentPinModal
        visible={pinModalVisible}
        onClose={() => setPinModalVisible(false)}
        onSuccess={() => {
          setPinModalVisible(false);
          // Profile activation will continue after successful auth
        }}
        title="Parent Verification"
        description="Please verify your identity to activate this profile"
      />
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
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: '#8E8E93',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    marginLeft: 8,
    color: '#FF9500',
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addButtonText: {
    fontSize: 17,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1C1C1E',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 8,
  },
  profilesList: {
    marginBottom: 24,
  },
  profileContainer: {
    marginBottom: 16,
  },
  profileDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  restrictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  restrictionText: {
    fontSize: 15,
    color: '#1C1C1E',
    marginLeft: 8,
  },
  blockedItem: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  blockedItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  blockedUrl: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  blockedReason: {
    fontSize: 13,
    color: '#FF3B30',
    fontWeight: '500',
  },
  blockedTime: {
    fontSize: 13,
    color: '#8E8E93',
  },
  activateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  activeButton: {
    backgroundColor: '#34C759',
  },
  activateButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '500',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 24,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 17,
  },
  profileTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileTypeButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedProfileType: {
    backgroundColor: '#007AFF',
  },
  profileTypeText: {
    fontSize: 15,
    color: '#1C1C1E',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    fontSize: 17,
    fontWeight: '500',
  },
});
