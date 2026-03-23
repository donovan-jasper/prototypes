import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { getEventById } from '../data/eventRepository';

const { width, height } = Dimensions.get('window');

const FullScreenAlert = ({ visible, eventId, onClose }) => {
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && eventId) {
      loadEventDetails();
    }
  }, [visible, eventId]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      const event = await getEventById(eventId);
      setEventData(event);
    } catch (error) {
      console.error('Error loading event details:', error);
      setEventData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.alertBox}>
          <Text style={styles.criticalText}>CRITICAL ALERT</Text>
          
          {loading ? (
            <Text style={styles.eventTitle}>Loading event details...</Text>
          ) : eventData ? (
            <>
              <Text style={styles.eventTitle}>{eventData.title}</Text>
              <Text style={styles.eventTime}>{formatDate(eventData.startDate)}</Text>
              <Text style={styles.eventLocation}>{eventData.location || 'Location not specified'}</Text>
              <Text style={styles.description}>{eventData.description || 'No description available'}</Text>
            </>
          ) : (
            <Text style={styles.eventTitle}>Event details not found</Text>
          )}
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>ACKNOWLEDGE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  alertBox: {
    width: width * 0.9,
    padding: 20,
    backgroundColor: '#ff4d4d',
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  criticalText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  eventTime: {
    fontSize: 16,
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  eventLocation: {
    fontSize: 16,
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#ff4d4d',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FullScreenAlert;
