import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { logInteraction, getAllFriends, initDatabase } from '@/lib/database';
import { Friend } from '@/lib/types';

type InteractionType = 'call' | 'text' | 'video' | 'in-person' | 'other';

export default function LogInteractionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const preselectedFriendId = params.friendId as string | undefined;

  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<string | undefined>(preselectedFriendId);
  const [interactionType, setInteractionType] = useState<InteractionType | undefined>();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFriendPicker, setShowFriendPicker] = useState(false);

  useEffect(() => {
    initDatabase().then(async () => {
      const allFriends = await getAllFriends();
      setFriends(allFriends);
      setLoading(false);
    });
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!selectedFriendId) {
      Alert.alert('Friend required', 'Please select a friend');
      return;
    }

    if (!interactionType) {
      Alert.alert('Type required', 'Please select an interaction type');
      return;
    }

    setSaving(true);
    try {
      await logInteraction({
        friendId: selectedFriendId,
        type: interactionType,
        date,
        notes: notes.trim() || undefined,
        photoUri,
      });
      
      router.back();
    } catch (error) {
      console.error('Error logging interaction:', error);
      Alert.alert('Error', 'Failed to log interaction. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getInteractionIcon = (type: InteractionType) => {
    switch (type) {
      case 'call': return '📞';
      case 'text': return '💬';
      case 'video': return '📹';
      case 'in-person': return '🤝';
      case 'other': return '✨';
    }
  };

  const getInteractionLabel = (type: InteractionType) => {
    switch (type) {
      case 'call': return 'Call';
      case 'text': return 'Text';
      case 'video': return 'Video';
      case 'in-person': return 'In-person';
      case 'other': return 'Other';
    }
  };

  const selectedFriend = friends.find(f => f.id === selectedFriendId);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Friend *</Text>
          <TouchableOpacity
            style={styles.friendSelector}
            onPress={() => setShowFriendPicker(!showFriendPicker)}
          >
            <Text style={selectedFriend ? styles.friendSelectorText : styles.friendSelectorPlaceholder}>
              {selectedFriend ? selectedFriend.name : 'Select a friend'}
            </Text>
            <Text style={styles.friendSelectorArrow}>{showFriendPicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showFriendPicker && (
            <View style={styles.friendList}>
              {friends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.friendItem}
                  onPress={() => {
                    setSelectedFriendId(friend.id);
                    setShowFriendPicker(false);
                  }}
                >
                  <Text style={styles.friendItemText}>{friend.name}</Text>
                  {selectedFriendId === friend.id && (
                    <Text style={styles.friendItemCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Interaction Type *</Text>
          <View style={styles.typeGrid}>
            {(['call', 'text', 'video', 'in-person', 'other'] as InteractionType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  interactionType === type && styles.typeButtonSelected,
                ]}
                onPress={() => setInteractionType(type)}
              >
                <Text style={styles.typeIcon}>{getInteractionIcon(type)}</Text>
                <Text style={[
                  styles.typeLabel,
                  interactionType === type && styles.typeLabelSelected,
                ]}>
                  {getInteractionLabel(type)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any memorable moments..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Photo (optional)</Text>
          {photoUri ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photoUri }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => setPhotoUri(undefined)}
              >
                <Text style={styles.removePhotoText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              <Text style={styles.photoButtonText}>📷 Add Photo</Text>
            </TouchableOpacity>
          )}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  friendSelector: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  friendSelectorText: {
    fontSize: 16,
    color: '#212121',
  },
  friendSelectorPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  friendSelectorArrow: {
    fontSize: 12,
    color: '#757575',
  },
  friendList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 200,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  friendItemText: {
    fontSize: 16,
    color: '#212121',
  },
  friendItemCheck: {
    fontSize: 18,
    color: '#6200EE',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    width: '30%',
  },
  typeButtonSelected: {
    borderColor: '#6200EE',
    backgroundColor: '#F3E5F5',
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
    color: '#757575',
  },
  typeLabelSelected: {
    color: '#6200EE',
    fontWeight: '600',
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
    height: 100,
    textAlignVertical: 'top',
  },
  photoContainer: {
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  removePhotoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  removePhotoText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '500',
  },
  photoButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  photoButtonText: {
    fontSize: 16,
    color: '#6200EE',
    fontWeight: '500',
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
