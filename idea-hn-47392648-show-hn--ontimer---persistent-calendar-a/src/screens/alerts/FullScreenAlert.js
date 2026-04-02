import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Vibration,
  Modal,
  StatusBar,
} from 'react-native';
import { getEventById } from '../../services/data/eventRepository';
import { acknowledgeAlert, snoozeAlert } from '../../services/notifications/notificationService'; // Import snoozeAlert

const { width, height } = Dimensions.get('window');

export default function FullScreenAlert({ visible, eventId, notificationId, onClose }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const [eventDetails, setEventDetails] = useState(null);
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false); // State for snooze options visibility
  const vibrateIntervalRef = useRef(null); // Ref to store interval ID

  useEffect(() => {
    if (visible && eventId) {
      // Fetch event details
      loadEventDetails();
      
      // Start animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 150,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Start vibration pattern
      Vibration.vibrate([100, 200, 100, 200, 100]);
      
      // Set up repeating vibration
      vibrateIntervalRef.current = setInterval(() => {
        Vibration.vibrate([100, 200, 100]);
      }, 3000);
      
      // Clear interval when component unmounts or becomes invisible
      return () => {
        if (vibrateIntervalRef.current) {
          clearInterval(vibrateIntervalRef.current);
        }
        Vibration.cancel();
        // Reset animations and snooze options when alert is dismissed
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.8);
        setShowSnoozeOptions(false);
      };
    } else if (!visible) {
      // Ensure vibrations are stopped if visibility changes to false
      if (vibrateIntervalRef.current) {
        clearInterval(vibrateIntervalRef.current);
        vibrateIntervalRef.current = null;
      }
      Vibration.cancel();
      setShowSnoozeOptions(false); // Ensure snooze options are hidden when alert is not visible
    }
  }, [visible, eventId, fadeAnim, scaleAnim]);

  const loadEventDetails = async () => {
    try {
      const event = await getEventById(eventId);
      setEventDetails(event);
    } catch (error) {
      console.error('Error loading event details:', error);
      setEventDetails({ title: 'Unknown Event' }); // Fallback
    }
  };

  const handleAcknowledge = async () => {
    if (eventId && notificationId) { // Ensure both eventId and notificationId are present
      try {
        // Call acknowledgeAlert, passing both notificationId and eventId
        await acknowledgeAlert(notificationId, eventId); 
        onClose(); // Close the full-screen alert UI
      } catch (error)
 {
        console.error('Error acknowledging alert:', error);
        // Optionally, show an error message to the user
        onClose(); // Still attempt to close the UI even if acknowledgment fails
      }
    } else {
      console.warn('Cannot acknowledge alert: Missing eventId or notificationId.');
      onClose(); // Close the UI even if data is missing
    }
  };

  const handleSnooze = async (durationInMinutes) => {
    if (eventId && notificationId) {
      try {
        // Call snoozeAlert, passing notificationId, eventId, and duration in seconds
        await snoozeAlert(notificationId, eventId, durationInMinutes * 60); // Convert minutes to seconds
        onClose(); // Close the full-screen alert UI
      } catch (error) {
        console.error('Error snoozing alert:', error);
        // Optionally, show an error message to the user
        onClose(); // Still attempt to close the UI even if snoozing fails
      }
    } else {
      console.warn('Cannot snooze alert: Missing eventId or notificationId.');
      onClose();
    }
    setShowSnoozeOptions(false); // Hide snooze options after selection
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={handleAcknowledge} // Android back button will trigger acknowledge
      statusBarTranslucent={true}
    >
      <StatusBar backgroundColor="#ff0000" barStyle="light-content" />
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <View style={styles.alertContainer}>
          <View style={styles.header}>
            <Text style={styles.alertTitle}>CRITICAL ALERT</Text>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.eventTitle} numberOfLines={2}>
              {eventDetails ? eventDetails.title : 'Loading event...'}
            </Text>
            
            <Text style={styles.message}>
              This is a critical event that requires your immediate attention!
            </Text>
            
            <Text style={styles.instruction}>
              You must acknowledge or snooze this alert.
            </Text>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.acknowledgeButton]}
              onPress={handleAcknowledge}
            >
              <Text style={styles.actionButtonText}>ACKNOWLEDGE</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.snoozeButton]}
              onPress={() => setShowSnoozeOptions(!showSnoozeOptions)}
            >
              <Text style={styles.actionButtonText}>SNOOZE</Text>
            </TouchableOpacity>

            {showSnoozeOptions && (
              <View style={styles.snoozeOptionsContainer}>
                <TouchableOpacity 
                  style={styles.snoozeOptionButton}
                  onPress={() => handleSnooze(5)}
                >
                  <Text style={styles.snoozeOptionText}>5 MIN</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.snoozeOptionButton}
                  onPress={() => handleSnooze(10)}
                >
                  <Text style={styles.snoozeOptionText}>10 MIN</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.snoozeOptionButton}
                  onPress={() => handleSnooze(15)}
                >
                  <Text style={styles.snoozeOptionText}>15 MIN</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#222',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 2,
    borderColor: '#ff0000',
  },
  header: {
    backgroundColor: '#ff0000',
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#cc0000',
  },
  alertTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  content: {
    padding: 25,
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 40,
  },
  message: {
    fontSize: 18,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 10,
  },
  instruction: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    flexDirection: 'column', // Changed to column to stack buttons
    alignItems: 'center',
  },
  actionButton: {
    width: '80%', // Make buttons wider
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 10, // Add margin between buttons
    alignItems: 'center',
    justifyContent: 'center',
  },
  acknowledgeButton: {
    backgroundColor: '#4CAF50', // Green for acknowledge
  },
  snoozeButton: {
    backgroundColor: '#FFC107', // Amber for snooze
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  snoozeOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
    backgroundColor: '#333',
    borderRadius: 10,
    paddingVertical: 10,
  },
  snoozeOptionButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#555',
    marginHorizontal: 5,
  },
  snoozeOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
