import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, StyleSheet, Alert, Switch, Image, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { saveItem, getItems } from '../utils/storage';
import { getChannels } from '../utils/channel';
import Voice from '@react-native-voice/voice';
import * as Sharing from 'expo-sharing';
import { MaterialIcons } from '@expo/vector-icons';

const CaptureScreen = () => {
  const [text, setText] = useState('');
  const [channels, setChannels] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [imageUri, setImageUri] = useState(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceResults, setVoiceResults] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timer, setTimer] = useState(null);

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
      if (timer) clearInterval(timer);
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
    if (timer) clearInterval(timer);
  };

  const startRecording = async () => {
    try {
      await Voice.start('en-US');
      setIsRecording(true);
      setRecordingTime(0);

      const newTimer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setTimer(newTimer);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
      if (timer) clearInterval(timer);
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
      setRecordingTime(0);
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
          <Text style={styles.modeLabel}>Voice Mode</Text>
          <Switch
            value={isVoiceMode}
            onValueChange={setIsVoiceMode}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isVoiceMode ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        {imageUri ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <TouchableOpacity onPress={() => setImageUri(null)} style={styles.removeImageButton}>
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Type your note or tap to record..."
            value={text}
            onChangeText={setText}
            editable={!isVoiceMode}
          />
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={handleImagePicker}
          >
            <MaterialIcons name="image" size={24} color="white" />
            <Text style={styles.actionButtonText}>Image</Text>
          </TouchableOpacity>

          {isVoiceMode ? (
            isRecording ? (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#f44336' }]}
                onPress={stopRecording}
              >
                <MaterialIcons name="mic" size={24} color="white" />
                <Text style={styles.actionButtonText}>Stop</Text>
                <Text style={styles.recordingTime}>{recordingTime}s</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                onPress={startRecording}
              >
                <MaterialIcons name="mic" size={24} color="white" />
                <Text style={styles.actionButtonText}>Record</Text>
              </TouchableOpacity>
            )
          ) : null}
        </View>

        {isRecording && (
          <View style={styles.recordingIndicator}>
            <ActivityIndicator size="small" color="#f44336" />
            <Text style={styles.recordingText}>Recording...</Text>
          </View>
        )}
      </View>

      <View style={styles.channelSection}>
        <Text style={styles.sectionTitle}>Save to Channel</Text>
        <Picker
          selectedValue={selectedChannelId}
          onValueChange={(itemValue) => setSelectedChannelId(itemValue)}
          style={styles.picker}
        >
          {channels.map(channel => (
            <Picker.Item key={channel.id} label={channel.name} value={channel.id} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>

      <View style={styles.recentItemsSection}>
        <Text style={styles.sectionTitle}>Recent Items</Text>
        <FlatList
          data={recentItems}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          style={styles.recentItemsList}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  captureSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modeLabel: {
    fontSize: 16,
    color: '#333',
  },
  textInput: {
    height: 120,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
  },
  recordingTime: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  recordingText: {
    color: '#f44336',
    marginLeft: 8,
    fontSize: 14,
  },
  channelSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recentItemsSection: {
    flex: 1,
  },
  recentItemsList: {
    flex: 1,
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  itemType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    color: '#999',
  },
});

export default CaptureScreen;
