import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, StyleSheet, Alert, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { saveItem, getItems } from '../utils/storage';
import { getChannels } from '../utils/channel';
import Voice from 'react-native-voice';
import * as Sharing from 'react-native-share-menu';

const CaptureScreen = () => {
  const [text, setText] = useState('');
  const [channels, setChannels] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [imageUri, setImageUri] = useState(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceResults, setVoiceResults] = useState([]);

  useEffect(() => {
    loadChannels();
    loadRecentItems();

    // Initialize voice recognition
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    // Handle shared content
    Sharing.addListener('onShare', handleSharedContent);

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      Sharing.removeListener('onShare');
    };
  }, []);

  const handleSharedContent = async (sharedData) => {
    if (sharedData.mimeType.includes('text')) {
      setText(sharedData.data);
    } else if (sharedData.mimeType.includes('image')) {
      setImageUri(sharedData.data);
    }
  };

  const onSpeechResults = (e) => {
    setVoiceResults(e.value);
    setText(prevText => prevText + ' ' + e.value.join(' '));
  };

  const onSpeechError = (e) => {
    console.error('Voice error:', e);
    setIsRecording(false);
  };

  const startRecording = async () => {
    try {
      await Voice.start('en-US');
      setIsRecording(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (e) {
      console.error(e);
    }
  };

  const loadChannels = async () => {
    try {
      const channelList = await getChannels();
      setChannels(channelList);
      if (channelList.length > 0) {
        setSelectedChannelId(channelList[0].id);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
    }
  };

  const loadRecentItems = async () => {
    try {
      const items = await getItems();
      setRecentItems(items.slice(-10).reverse());
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const detectType = (content) => {
    if (imageUri) return 'image';
    if (voiceResults.length > 0) return 'voice';
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlPattern.test(content) ? 'url' : 'text';
  };

  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!text.trim() && !imageUri && voiceResults.length === 0) {
      Alert.alert('Error', 'Please enter text, select an image, or record a voice memo');
      return;
    }

    if (!selectedChannelId) {
      Alert.alert('Error', 'Please select a channel');
      return;
    }

    try {
      const content = imageUri || text;
      const type = detectType(content);

      const metadata = {
        voiceTranscript: voiceResults.join(' '),
        recordingDuration: voiceResults.length > 0 ? (voiceResults.length * 0.5).toFixed(1) : null
      };

      await saveItem(content, type, selectedChannelId, metadata);

      setText('');
      setImageUri(null);
      setVoiceResults([]);
      await loadRecentItems();

      Alert.alert('Success', 'Item saved successfully!');
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', 'Failed to save item');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemType}>{item.type.toUpperCase()}</Text>
      <Text style={styles.itemText} numberOfLines={2}>
        {item.type === 'voice' ? item.metadata?.voiceTranscript || 'Voice memo' : item.text}
      </Text>
      <Text style={styles.itemDate}>{new Date(item.created_at).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.captureSection}>
        <View style={styles.modeToggleContainer}>
          <Text style={styles.modeLabel}>Text Mode</Text>
          <Switch
            value={isVoiceMode}
            onValueChange={(value) => setIsVoiceMode(value)}
          />
          <Text style={styles.modeLabel}>Voice Mode</Text>
        </View>

        {isVoiceMode ? (
          <View style={styles.voiceInputContainer}>
            <TouchableOpacity
              style={[styles.voiceButton, isRecording && styles.recordingButton]}
              onPressIn={startRecording}
              onPressOut={stopRecording}
            >
              <Text style={styles.voiceButtonText}>
                {isRecording ? 'Recording...' : 'Hold to Record'}
              </Text>
            </TouchableOpacity>
            {voiceResults.length > 0 && (
              <Text style={styles.voiceTranscript}>
                {voiceResults.join(' ')}
              </Text>
            )}
          </View>
        ) : (
          <TextInput
            style={styles.input}
            onChangeText={setText}
            value={text}
            placeholder="Type a note or paste a link..."
            multiline
          />
        )}

        <TouchableOpacity style={styles.imageButton} onPress={handleImagePicker}>
          <Text style={styles.imageButtonText}>
            {imageUri ? '✓ Image Selected' : '📷 Pick Image'}
          </Text>
        </TouchableOpacity>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Channel:</Text>
          <Picker
            selectedValue={selectedChannelId}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedChannelId(itemValue)}
          >
            {channels.map((channel) => (
              <Picker.Item key={channel.id} label={channel.name} value={channel.id} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.recentTitle}>Recently Saved</Text>
        <FlatList
          data={recentItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No items yet. Start capturing!</Text>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  captureSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  modeLabel: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  voiceInputContainer: {
    marginBottom: 15,
  },
  voiceButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  recordingButton: {
    backgroundColor: '#F44336',
  },
  voiceButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  voiceTranscript: {
    fontSize: 14,
    color: '#666',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  input: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    padding: 10,
    fontSize: 16,
  },
  imageButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  imageButtonText: {
    color: 'white',
    fontSize: 16,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#9C27B0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recentSection: {
    flex: 1,
    padding: 20,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 5,
  },
  itemDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
});

export default CaptureScreen;
