import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const PlantDetail = ({ route, navigation }) => {
  const { plant } = route.params;
  const [photos, setPhotos] = useState(plant.photos || []);
  const [reminders, setReminders] = useState(plant.reminders || []);
  const [communityPosts, setCommunityPosts] = useState(plant.communityPosts || []);

  const addPhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Please enable camera roll permissions in settings');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newPhoto = {
        uri: result.assets[0].uri,
        date: new Date().toISOString().split('T')[0],
        caption: ''
      };
      setPhotos([...photos, newPhoto]);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Please enable camera permissions in settings');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newPhoto = {
        uri: result.assets[0].uri,
        date: new Date().toISOString().split('T')[0],
        caption: ''
      };
      setPhotos([...photos, newPhoto]);
    }
  };

  const renderPhotoItem = ({ item }) => (
    <View style={styles.photoItem}>
      <Image source={{ uri: item.uri }} style={styles.photo} />
      <Text style={styles.photoDate}>{item.date}</Text>
      {item.caption ? <Text style={styles.photoCaption}>{item.caption}</Text> : null}
    </View>
  );

  const renderReminderItem = ({ item }) => (
    <View style={styles.reminderItem}>
      <Text style={styles.reminderText}>{item.text}</Text>
      <Text style={styles.reminderDate}>{item.date}</Text>
    </View>
  );

  const renderPostItem = ({ item }) => (
    <View style={styles.postItem}>
      <Text style={styles.postAuthor}>{item.author}</Text>
      <Text style={styles.postContent}>{item.content}</Text>
      <Text style={styles.postDate}>{item.date}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.plantName}>{plant.name}</Text>
        <Text style={styles.plantSpecies}>{plant.species}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photo Timeline</Text>
        {photos.length > 0 ? (
          <FlatList
            horizontal
            data={photos}
            renderItem={renderPhotoItem}
            keyExtractor={(item, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
          />
        ) : (
          <Text style={styles.emptyText}>No photos yet. Add your first photo!</Text>
        )}

        <View style={styles.photoActions}>
          <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
            <Ionicons name="camera" size={24} color="white" />
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoButton} onPress={addPhoto}>
            <Ionicons name="images" size={24} color="white" />
            <Text style={styles.buttonText}>Add from Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Care Reminders</Text>
        {reminders.length > 0 ? (
          <FlatList
            data={reminders}
            renderItem={renderReminderItem}
            keyExtractor={(item, index) => index.toString()}
          />
        ) : (
          <Text style={styles.emptyText}>No upcoming reminders</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Community Posts</Text>
        {communityPosts.length > 0 ? (
          <FlatList
            data={communityPosts}
            renderItem={renderPostItem}
            keyExtractor={(item, index) => index.toString()}
          />
        ) : (
          <Text style={styles.emptyText}>No community posts yet</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  plantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  plantSpecies: {
    fontSize: 16,
    color: 'white',
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  photoItem: {
    marginRight: 15,
    width: 150,
  },
  photo: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  photoDate: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
  photoCaption: {
    marginTop: 3,
    fontSize: 12,
    color: '#444',
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    marginLeft: 5,
  },
  reminderItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reminderText: {
    fontSize: 16,
  },
  reminderDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  postItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  postAuthor: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  postContent: {
    marginTop: 5,
    fontSize: 14,
  },
  postDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    padding: 10,
  },
});

export default PlantDetail;
