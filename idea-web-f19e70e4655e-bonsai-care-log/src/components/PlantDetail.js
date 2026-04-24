import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const PlantDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { plantId } = route.params;
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch plant details
    const fetchPlantDetails = async () => {
      try {
        // In a real app, this would be an actual API call with the plantId
        const mockPlant = {
          id: plantId,
          name: 'Monstera Deliciosa',
          nickname: 'Big Monsta',
          image: 'https://images.unsplash.com/photo-1588082961428-9b7c5f4927d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          lastWatered: '2023-05-15',
          wateringFrequency: 7,
          nextWatering: '2023-05-22',
          careNotes: 'Needs bright, indirect light. Fertilize every 4 weeks.',
          growthStage: 'Mature',
          acquiredDate: '2022-03-10',
          location: 'Living room',
          sunlight: 'Bright, indirect',
          soilType: 'Well-draining potting mix',
          lastFertilized: '2023-04-15',
          fertilizerFrequency: 30,
          nextFertilizing: '2023-05-15'
        };
        setPlant(mockPlant);
      } catch (error) {
        console.error('Error fetching plant details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlantDetails();
  }, [plantId]);

  const calculateDaysUntil = (dateString) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Loading plant details...</Text>
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Plant not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const daysUntilWatering = calculateDaysUntil(plant.nextWatering);
  const daysUntilFertilizing = calculateDaysUntil(plant.nextFertilizing);

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: plant.image }} style={styles.plantImage} />
      <View style={styles.infoContainer}>
        <Text style={styles.plantName}>{plant.nickname || plant.name}</Text>
        <Text style={styles.plantSpecies}>{plant.name}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Care Reminders</Text>
          <View style={styles.reminderItem}>
            <Text style={styles.reminderLabel}>Watering:</Text>
            <Text style={styles.reminderValue}>
              Every {plant.wateringFrequency} days
            </Text>
            <Text style={[
              styles.reminderStatus,
              daysUntilWatering <= 3 ? styles.urgentStatus : styles.normalStatus
            ]}>
              {daysUntilWatering <= 0 ? 'Overdue' : `Due in ${daysUntilWatering} days`}
            </Text>
          </View>
          <View style={styles.reminderItem}>
            <Text style={styles.reminderLabel}>Fertilizing:</Text>
            <Text style={styles.reminderValue}>
              Every {plant.fertilizerFrequency} days
            </Text>
            <Text style={[
              styles.reminderStatus,
              daysUntilFertilizing <= 3 ? styles.urgentStatus : styles.normalStatus
            ]}>
              {daysUntilFertilizing <= 0 ? 'Overdue' : `Due in ${daysUntilFertilizing} days`}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plant Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Growth Stage:</Text>
            <Text style={styles.detailValue}>{plant.growthStage}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Acquired:</Text>
            <Text style={styles.detailValue}>{plant.acquiredDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>{plant.location}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Care Requirements</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Sunlight:</Text>
            <Text style={styles.detailValue}>{plant.sunlight}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Soil Type:</Text>
            <Text style={styles.detailValue}>{plant.soilType}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Care Notes</Text>
          <Text style={styles.careNotes}>{plant.careNotes}</Text>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CareReminders')}
        >
          <Text style={styles.actionButtonText}>View All Reminders</Text>
        </TouchableOpacity>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  plantImage: {
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
  plantSpecies: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reminderLabel: {
    fontSize: 16,
    color: '#444',
  },
  reminderValue: {
    fontSize: 16,
  },
  reminderStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentStatus: {
    backgroundColor: '#FFEBEE',
    color: '#FF5252',
  },
  normalStatus: {
    backgroundColor: '#E8F5E9',
    color: '#4CAF50',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    width: '40%',
  },
  detailValue: {
    fontSize: 16,
    width: '60%',
  },
  careNotes: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PlantDetail;
