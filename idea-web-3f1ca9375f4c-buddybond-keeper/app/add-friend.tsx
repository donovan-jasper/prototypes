import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { addFriend } from '@/lib/database';

export default function AddFriendScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [birthday, setBirthday] = useState('');
  const [interests, setInterests] = useState('');
  const [reminderFrequency, setReminderFrequency] = useState('30');
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Please allow access to your camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a name for your friend');
      return;
    }

    const frequency = parseInt(reminderFrequency, 10);
    if (isNaN(frequency) || frequency < 1) {
      Alert.alert('Invalid frequency', 'Please enter a valid number of days');
      return;
    }

    setSaving(true);
    try {
      await addFriend({
        name: name.trim(),
        photoUri,
        birthday: birthday.trim() || undefined,
        interests: interests.trim() || undefined,
        reminderFrequency: frequency,
      });
      
      router.back();
    } catch (error) {
      console.error('Error adding friend:', error);
      Alert.alert('Error', 'Failed to add friend. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.photoSection}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>No Photo</Text>
            </View>
          )}
          
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              <Text style={styles.photoButtonText}>Choose Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
              <Text style={styles.photoButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter friend's name"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Birthday (optional)</Text>
          <TextInput
            style={styles.input}
            value={birthday}
            onChangeText={setBirthday}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Interests (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={interests}
            onChangeText={setInterests}
            placeholder="Books, sports, hobbies..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Reminder Frequency (days)</Text>
          <TextInput
            style={styles.input}
            value={reminderFrequency}
            onChangeText={setReminderFrequency}
            placeholder="30"
            placeholderTextColor="#999"
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: '#757575',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6200EE',
  },
  photoButtonText: {
    color: '#6200EE',
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212121',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#6200EE',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
