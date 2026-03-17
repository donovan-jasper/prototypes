import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { saveItem } from '../utils/storage';
import { getChannels } from '../utils/channel';

const CaptureScreen = () => {
  const [text, setText] = useState('');
  const [type, setType] = useState('text');
  const [channels, setChannels] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [showChannelPicker, setShowChannelPicker] = useState(false);
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (text.match(urlRegex)) {
      setType('link');
    } else if (type === 'link' && !text.match(urlRegex)) {
      setType('text');
    }
  }, [text]);

  const loadChannels = async () => {
    const loadedChannels = await getChannels();
    setChannels(loadedChannels);
    if (loadedChannels.length > 0) {
      setSelectedChannelId(loadedChannels[0].id);
    }
  };

  const handleSave = async () => {
    if (!text.trim() && !imageUri) {
      Alert.alert('Error', 'Please enter some content or select an image');
      return;
    }

    try {
      const contentToSave = imageUri || text;
      await saveItem(contentToSave, type, selectedChannelId);
      Alert.alert('Success', 'Item saved successfully');
      setText('');
      setImageUri(null);
      setType('text');
    } catch (error) {
      Alert.alert('Error', 'Failed to save item');
    }
  };

  const pickImage = async (useCamera) => {
    const { status } = useCamera 
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera/gallery permissions');
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setType('image');
    }
  };

  const getSelectedChannelName = () => {
    const channel = channels.find(c => c.id === selectedChannelId);
    return channel ? channel.name : 'Select Channel';
  };

  const getTypeLabel = () => {
    const labels = {
      text: 'Text',
      link: 'Link',
      image: 'Image',
      voice: 'Voice'
    };
    return labels[type] || 'Text';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'text' && styles.typeButtonActive]}
          onPress={() => { setType('text'); setImageUri(null); }}
        >
          <Ionicons name="text" size={20} color={type === 'text' ? '#007AFF' : '#666'} />
          <Text style={[styles.typeButtonText, type === 'text' && styles.typeButtonTextActive]}>Text</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, type === 'link' && styles.typeButtonActive]}
          onPress={() => { setType('link'); setImageUri(null); }}
        >
          <Ionicons name="link" size={20} color={type === 'link' ? '#007AFF' : '#666'} />
          <Text style={[styles.typeButtonText, type === 'link' && styles.typeButtonTextActive]}>Link</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, type === 'image' && styles.typeButtonActive]}
          onPress={() => setType('image')}
        >
          <Ionicons name="image" size={20} color={type === 'image' ? '#007AFF' : '#666'} />
          <Text style={[styles.typeButtonText, type === 'image' && styles.typeButtonTextActive]}>Image</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, type === 'voice' && styles.typeButtonActive]}
          onPress={() => { setType('voice'); setImageUri(null); }}
        >
          <Ionicons name="mic" size={20} color={type === 'voice' ? '#007AFF' : '#666'} />
          <Text style={[styles.typeButtonText, type === 'voice' && styles.typeButtonTextActive]}>Voice</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.channelPicker}
        onPress={() => setShowChannelPicker(!showChannelPicker)}
      >
        <Text style={styles.channelPickerLabel}>Channel:</Text>
        <View style={styles.channelPickerValue}>
          <Text style={styles.channelPickerText}>{getSelectedChannelName()}</Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </View>
      </TouchableOpacity>

      {showChannelPicker && (
        <View style={styles.channelList}>
          {channels.map(channel => (
            <TouchableOpacity
              key={channel.id}
              style={[
                styles.channelItem,
                selectedChannelId === channel.id && styles.channelItemActive
              ]}
              onPress={() => {
                setSelectedChannelId(channel.id);
                setShowChannelPicker(false);
              }}
            >
              <Text style={[
                styles.channelItemText,
                selectedChannelId === channel.id && styles.channelItemTextActive
              ]}>
                {channel.name}
              </Text>
              {selectedChannelId === channel.id && (
                <Ionicons name="checkmark" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {type === 'image' && (
        <View style={styles.imageControls}>
          <TouchableOpacity style={styles.imageButton} onPress={() => pickImage(true)}>
            <Ionicons name="camera" size={24} color="#007AFF" />
            <Text style={styles.imageButtonText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.imageButton} onPress={() => pickImage(false)}>
            <Ionicons name="images" size={24} color="#007AFF" />
            <Text style={styles.imageButtonText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      )}

      {imageUri && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <TouchableOpacity 
            style={styles.removeImageButton}
            onPress={() => setImageUri(null)}
          >
            <Ionicons name="close-circle" size={30} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      )}

      {type !== 'image' && (
        <TextInput
          style={styles.input}
          onChangeText={setText}
          value={text}
          placeholder={
            type === 'voice' 
              ? 'Voice recording not yet implemented...' 
              : type === 'link'
              ? 'Paste a URL...'
              : 'Type your thought...'
          }
          multiline
          editable={type !== 'voice'}
        />
      )}

      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Type:</Text>
          <Text style={styles.infoValue}>{getTypeLabel()}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Channel:</Text>
          <Text style={styles.infoValue}>{getSelectedChannelName()}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 5,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: '#fff',
  },
  typeButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  channelPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 10,
  },
  channelPickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  channelPickerValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelPickerText: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 5,
  },
  channelList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 15,
  },
  channelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  channelItemActive: {
    backgroundColor: '#f0f8ff',
  },
  channelItemText: {
    fontSize: 16,
    color: '#333',
  },
  channelItemTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  imageControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  imageButton: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  imageButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  imagePreview: {
    position: 'relative',
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  input: {
    minHeight: 120,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  infoBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CaptureScreen;
