import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const PlantDetail = () => {
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  const { plantId } = route.params;

  useEffect(() => {
    // Simulate API call to fetch plant details
    const fetchPlantDetails = async () => {
      try {
        // In a real app, this would be an actual API call
        const mockData = {
          id: plantId,
          name: 'Monstera Deliciosa',
          scientificName: 'Monstera deliciosa',
          acquiredDate: '2023-01-15',
          lastWatered: '2023-05-15',
          nextWatering: '2023-05-22',
          lightRequirements: 'Bright, indirect light',
          wateringFrequency: 'Every 7-10 days',
          photos: [
            { id: '1', uri: 'https://example.com/monstera1.jpg', date: '2023-01-15' },
            { id: '2', uri: 'https://example.com/monstera2.jpg', date: '2023-03-20' },
            { id: '3', uri: 'https://example.com/monstera3.jpg', date: '2023-05-15' }
          ],
          careReminders: [
            { id: '1', type: 'Water', dueDate: '2023-05-22', completed: false },
            { id: '2', type: 'Fertilize', dueDate: '2023-06-05', completed: false }
          ],
          communityPosts: [
            { id: '1', user: 'GreenThumb123', content: 'My Monstera is growing so fast!', date: '2023-05-10' },
            { id: '2', user: 'PlantLover', content: 'Just added a new Monstera to my collection.', date: '2023-05-08' },
            { id: '3', user: 'VerdantUser', content: 'What kind of soil do you use for your Monstera?', date: '2023-05-05' }
          ]
        };
        setPlant(mockData);
      } catch (error) {
        console.error('Error fetching plant details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlantDetails();
  }, [plantId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={styles.container}>
        <Text>Plant not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: plant.photos[plant.photos.length - 1].uri }}
        style={styles.mainImage}
      />

      <View style={styles.infoContainer}>
        <Text style={styles.plantName}>{plant.name}</Text>
        <Text style={styles.scientificName}>{plant.scientificName}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Care Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Acquired:</Text>
            <Text style={styles.infoValue}>{plant.acquiredDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Watered:</Text>
            <Text style={styles.infoValue}>{plant.lastWatered}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Next Watering:</Text>
            <Text style={styles.infoValue}>{plant.nextWatering}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Light:</Text>
            <Text style={styles.infoValue}>{plant.lightRequirements}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Watering:</Text>
            <Text style={styles.infoValue}>{plant.wateringFrequency}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo Timeline</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {plant.photos.map(photo => (
              <Image
                key={photo.id}
                source={{ uri: photo.uri }}
                style={styles.timelineImage}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Care Reminders</Text>
          {plant.careReminders.map(reminder => (
            <View key={reminder.id} style={styles.reminderItem}>
              <Text style={styles.reminderType}>{reminder.type}</Text>
              <Text style={styles.reminderDate}>Due: {reminder.dueDate}</Text>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => {
                  // In a real app, this would update the reminder status
                  console.log(`Marked ${reminder.type} as complete`);
                }}
              >
                <Text style={styles.completeButtonText}>Complete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Posts</Text>
          {plant.communityPosts.map(post => (
            <View key={post.id} style={styles.postItem}>
              <Text style={styles.postUser}>{post.user}</Text>
              <Text style={styles.postContent}>{post.content}</Text>
              <Text style={styles.postDate}>{post.date}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 16,
  },
  plantName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2E7D32',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 120,
    fontWeight: '600',
    color: '#555',
  },
  infoValue: {
    flex: 1,
  },
  timelineImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
    resizeMode: 'cover',
  },
  reminderItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
  },
  reminderType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reminderDate: {
    color: '#555',
    marginBottom: 8,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  postItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
  },
  postUser: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  postContent: {
    marginBottom: 8,
  },
  postDate: {
    color: '#777',
    fontSize: 12,
  },
});

export default PlantDetail;
