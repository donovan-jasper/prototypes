import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const EventScreen = ({ route, navigation }) => {
  const { event } = route.params;
  
  const spotsLeft = event.maxCapacity - event.currentParticipants;
  const isAlmostFull = spotsLeft <= 2;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{event.emoji}</Text>
        <Text style={styles.title}>{event.title}</Text>
      </View>
      
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📍 Location</Text>
          <Text style={styles.infoValue}>{event.location}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🕐 Start Time</Text>
          <Text style={styles.infoValue}>{event.time}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📏 Distance</Text>
          <Text style={styles.infoValue}>{event.distance} miles away</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>👥 Participants</Text>
          <Text style={styles.infoValue}>
            {event.currentParticipants} / {event.maxCapacity}
          </Text>
        </View>
      </View>

      <View style={styles.descriptionCard}>
        <Text style={styles.descriptionTitle}>About this activity</Text>
        <Text style={styles.description}>{event.description}</Text>
      </View>

      {isAlmostFull && (
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>
            ⚠️ Only {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left!
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => {
          alert(`You've joined ${event.title} at ${event.location}!`);
          navigation.goBack();
        }}
      >
        <Text style={styles.joinButtonText}>Join Activity</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  warningCard: {
    backgroundColor: '#FFF3CD',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  warningText: {
    fontSize: 16,
    color: '#856404',
    fontWeight: '600',
    textAlign: 'center',
  },
  joinButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EventScreen;
