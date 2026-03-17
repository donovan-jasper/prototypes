import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { saveItem, getItems } from '../utils/storage';
import { getChannels } from '../utils/channel';

const CaptureScreen = () => {
  const [text, setText] = useState('');
  const [channels, setChannels] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    loadChannels();
    loadRecentItems();
  }, []);

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
    if (!text.trim() && !imageUri) {
      Alert.alert('Error', 'Please enter text or select an image');
      return;
    }

    if (!selectedChannelId) {
      Alert.alert('Error', 'Please select a channel');
      return;
    }

    try {
      const content = imageUri || text;
      const type = detectType(content);
      
      await saveItem(content, type, selectedChannelId);
      
      setText('');
      setImageUri(null);
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
      <Text style={styles.itemText} numberOfLines={2}>{item.text}</Text>
      <Text style={styles.itemDate}>{new Date(item.created_at).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.captureSection}>
        <TextInput
          style={styles.input}
          onChangeText={setText}
          value={text}
          placeholder="Type a note or paste a link..."
          multiline
        />

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
  input: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    padding: 10,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  imageButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  picker: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recentSection: {
    flex: 1,
    padding: 20,
  },
  recentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  itemType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  itemDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
  },
});

export default CaptureScreen;
