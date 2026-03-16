import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Slider } from 'react-native';
import { AppContext } from '../context/AppContext';
import { ActivityProfile } from '../types';

export const ProfilesScreen: React.FC = () => {
  const { profiles, addProfile, updateProfile, deleteProfile } = useContext(AppContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ActivityProfile | null>(null);
  const [profileName, setProfileName] = useState('');
  const [sensitivity, setSensitivity] = useState(5);

  const handleAddProfile = () => {
    setEditingProfile(null);
    setProfileName('');
    setSensitivity(5);
    setModalVisible(true);
  };

  const handleEditProfile = (profile: ActivityProfile) => {
    setEditingProfile(profile);
    setProfileName(profile.name);
    setSensitivity(profile.sensitivity);
    setModalVisible(true);
  };

  const handleSaveProfile = () => {
    if (editingProfile) {
      updateProfile({
        ...editingProfile,
        name: profileName,
        sensitivity,
      });
    } else {
      addProfile({
        id: Date.now().toString(),
        name: profileName,
        icon: '📚',
        sensitivity,
      });
    }
    setModalVisible(false);
  };

  const handleDeleteProfile = () => {
    if (editingProfile) {
      deleteProfile(editingProfile.id);
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Profiles</Text>

      <ScrollView style={styles.profileList}>
        {profiles.map(profile => (
          <TouchableOpacity
            key={profile.id}
            style={styles.profileItem}
            onPress={() => handleEditProfile(profile)}
          >
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileSensitivity}>Sensitivity: {profile.sensitivity}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={handleAddProfile}>
        <Text style={styles.addButtonText}>Add Profile</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingProfile ? 'Edit Profile' : 'Add Profile'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Profile Name"
              value={profileName}
              onChangeText={setProfileName}
            />

            <Text style={styles.sliderLabel}>Sensitivity: {sensitivity}</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={sensitivity}
              onValueChange={setSensitivity}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>

              {editingProfile && (
                <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteProfile}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileList: {
    flex: 1,
  },
  profileItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileSensitivity: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  slider: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#666',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
