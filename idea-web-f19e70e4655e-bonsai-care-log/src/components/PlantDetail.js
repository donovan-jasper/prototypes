import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ScrollView, Alert, Modal, TextInput, Button, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const PlantDetail = ({ route, navigation }) => {
  const { plant } = route.params;
  const [photos, setPhotos] = useState(plant.photos || []);
  const [reminders, setReminders] = useState(plant.reminders || []);
  const [modalVisible, setModalVisible] = useState(false);
  const [reminderText, setReminderText] = useState('');
  const [reminderDate, setReminderDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [photoCaption, setPhotoCaption] = useState('');
  const [watered, setWatered] = useState(plant.watered || false);
  const [lastWatered, setLastWatered] = useState(plant.lastWatered || null);

  useEffect(() => {
    // Fetch plant details from API
    fetch(`/api/plants/${plant.id}`)
      .then(response => response.json())
      .then(data => {
        setPhotos(data.photos || []);
        setReminders(data.reminders || []);
        setWatered(data.watered || false);
        setLastWatered(data.lastWatered || null);
      })
      .catch(error => console.error('Error fetching plant details:', error));
  }, [plant.id]);

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
        caption: photoCaption
      };
      setPhotos([...photos, newPhoto]);
      setPhotoCaption('');
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
        caption: photoCaption
      };
      setPhotos([...photos, newPhoto]);
      setPhotoCaption('');
    }
  };

  const addReminder = () => {
    if (reminderText.trim() === '') {
      Alert.alert('Error', 'Please enter reminder text');
      return;
    }

    const newReminder = {
      text: reminderText,
      date: reminderDate.toISOString().split('T')[0],
      completed: false
    };

    setReminders([...reminders, newReminder]);
    setReminderText('');
    setReminderDate(new Date());
    setModalVisible(false);
  };

  const toggleReminderCompletion = (index) => {
    const updatedReminders = [...reminders];
    updatedReminders[index].completed = !updatedReminders[index].completed;
    setReminders(updatedReminders);
  };

  const toggleWatered = () => {
    const newWateredStatus = !watered;
    setWatered(newWateredStatus);
    if (newWateredStatus) {
      setLastWatered(new Date().toISOString().split('T')[0]);
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || reminderDate;
    setShowDatePicker(Platform.OS === 'ios');
    setReminderDate(currentDate);
  };

  const renderPhotoItem = ({ item }) => (
    <View style={styles.photoItem}>
      <Image source={{ uri: item.uri }} style={styles.photo} />
      <Text style={styles.photoDate}>{item.date}</Text>
      {item.caption ? <Text style={styles.photoCaption}>{item.caption}</Text> : null}
    </View>
  );

  const renderReminderItem = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.reminderItem, item.completed && styles.completedReminder]}
      onPress={() => toggleReminderCompletion(index)}
    >
      <View style={styles.reminderContent}>
        <Text style={styles.reminderText}>{item.text}</Text>
        <Text style={styles.reminderDate}>{item.date}</Text>
      </View>
      <Ionicons
        name={item.completed ? 'checkbox-outline' : 'square-outline'}
        size={24}
        color={item.completed ? '#4CAF50' : '#757575'}
      />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.plantName}>{plant.name}</Text>
        <Text style={styles.plantSpecies}>{plant.species}</Text>
        <Text style={styles.plantAcquisition}>Acquired: {plant.acquisitionDate || 'Unknown'}</Text>
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
            contentContainerStyle={styles.photoList}
          />
        ) : (
          <Text style={styles.emptyText}>No photos yet. Add your first photo!</Text>
        )}

        <View style={styles.photoActions}>
          <TouchableOpacity style={styles.button} onPress={addPhoto}>
            <Ionicons name="images-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Add Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.captionInput}
          placeholder="Add a caption for your photo..."
          value={photoCaption}
          onChangeText={setPhotoCaption}
        />
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
          <Text style={styles.emptyText}>No reminders yet. Add your first reminder!</Text>
        )}

        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={20} color="#4CAF50" />
          <Text style={styles.addButtonText}>Add Reminder</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Watering Status</Text>
        <View style={styles.wateringContainer}>
          <TouchableOpacity
            style={[styles.waterToggle, watered && styles.watered]}
            onPress={toggleWatered}
          >
            <Ionicons
              name={watered ? 'water' : 'water-outline'}
              size={24}
              color={watered ? '#4CAF50' : '#757575'}
            />
            <Text style={styles.waterToggleText}>
              {watered ? 'Watered Today' : 'Mark as Watered'}
            </Text>
          </TouchableOpacity>
          {lastWatered && (
            <Text style={styles.lastWateredText}>Last watered: {lastWatered}</Text>
          )}
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Reminder</Text>

            <TextInput
              style={styles.input}
              placeholder="Reminder text"
              value={reminderText}
              onChangeText={setReminderText}
            />

            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                {reminderDate.toDateString()}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={reminderDate}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}

            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} color="#757575" />
              <Button title="Add" onPress={addReminder} color="#4CAF50" />
            </View>
          </View>
        </View>
      </Modal>
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  plantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  plantSpecies: {
    fontSize: 16,
    color: '#e8f5e9',
    marginBottom: 5,
  },
  plantAcquisition: {
    fontSize: 14,
    color: '#e8f5e9',
  },
  section: {
    margin: 20,
    padding: 15,
    backgroundColor: '#fff',
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
    color: '#4CAF50',
  },
  photoList: {
    paddingVertical: 10,
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
    color: '#757575',
    textAlign: 'center',
  },
  photoCaption: {
    marginTop: 5,
    fontSize: 12,
    color: '#424242',
    textAlign: 'center',
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 5,
  },
  captionInput: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  completedReminder: {
    opacity: 0.6,
  },
  reminderContent: {
    flex: 1,
  },
  reminderText: {
    fontSize: 16,
    marginBottom: 5,
  },
  reminderDate: {
    fontSize: 12,
    color: '#757575',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginTop: 10,
  },
  addButtonText: {
    color: '#4CAF50',
    marginLeft: 5,
  },
  wateringContainer: {
    alignItems: 'center',
  },
  waterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    width: '100%',
    justifyContent: 'center',
  },
  watered: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  waterToggleText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#4CAF50',
  },
  lastWateredText: {
    marginTop: 10,
    fontSize: 14,
    color: '#757575',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  datePickerButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
  },
  datePickerText: {
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
    marginVertical: 10,
  },
});

export default PlantDetail;
