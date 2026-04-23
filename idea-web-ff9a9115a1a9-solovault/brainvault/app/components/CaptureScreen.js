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
      <Text style={styles.itemText}>{item.content}</Text>
      <Text style={styles.itemMeta}>{item.type} • {new Date(item.createdAt).toLocaleDateString()}</Text>
    </View>
  );

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Capture</Text>
        <View style={styles.modeToggle}>
          <Text style={styles.toggleLabel}>Voice Mode</Text>
          <Switch
            value={isVoiceMode}
            onValueChange={setIsVoiceMode}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isVoiceMode ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
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
          style={styles.input}
          multiline
          placeholder="Type your note or hold to record..."
          value={text}
          onChangeText={setText}
          onLongPress={() => {
            if (isVoiceMode) startRecording();
          }}
        />
      )}

      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
        </View>
      )}

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, isRecording && styles.recordingButton]}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={!isVoiceMode}
        >
          <MaterialIcons
            name={isRecording ? 'stop' : 'mic'}
            size={24}
            color={isRecording ? 'white' : '#6200ee'}
          />
          <Text style={[styles.controlButtonText, isRecording && styles.recordingButtonText]}>
            {isRecording ? 'Stop' : 'Record'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={handleImagePicker}>
          <MaterialIcons name="image" size={24} color="#6200ee" />
          <Text style={styles.controlButtonText}>Image</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.channelSelector}>
        <Text style={styles.sectionTitle}>Channel</Text>
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

      <View style={styles.recentItems}>
        <Text style={styles.sectionTitle}>Recent Items</Text>
        <FlatList
          data={recentItems}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No recent items</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    marginRight: 8,
    color: '#666',
  },
  input: {
    height: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    backgroundColor: 'white',
    textAlignVertical: 'top',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  recordingButton: {
    backgroundColor: '#ff3b30',
    borderColor: '#ff3b30',
  },
  controlButtonText: {
    marginLeft: 8,
    color: '#6200ee',
  },
  recordingButtonText: {
    color: 'white',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  channelSelector: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  recentItems: {
    flex: 1,
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  itemText: {
    fontSize: 16,
    marginBottom: 5,
  },
  itemMeta: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff3b30',
    marginRight: 8,
  },
  recordingTime: {
    color: '#ff3b30',
    fontWeight: 'bold',
  },
});

export default CaptureScreen;
