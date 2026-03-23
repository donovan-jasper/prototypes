import React, { useEffect, useRef } from 'react';
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
import { acknowledgeAlert, dismissAlert } from '../../services/notifications/notificationService';

const { width, height } = Dimensions.get('window');

export default function FullScreenAlert({ visible, eventId, onClose }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    if (visible) {
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
      const vibrateInterval = setInterval(() => {
        Vibration.vibrate([100, 200, 100]);
      }, 3000);
      
      // Clear interval when component unmounts
      return () => {
        clearInterval(vibrateInterval);
        Vibration.cancel();
      };
    }
  }, [visible]);

  const handleAcknowledge = async () => {
    if (eventId) {
      try {
        // Acknowledge the alert
        await acknowledgeAlert(null, eventId); // Pass null for notificationId since we're handling it differently
        onClose();
      } catch (error) {
        console.error('Error acknowledging alert:', error);
      }
    }
  };

  const handleSnooze = async (durationMinutes) => {
    if (eventId) {
      try {
        // Dismiss current alerts
        await dismissAlert(eventId);
        
        // Reschedule for later (this would require additional logic in the notification service)
        // For now, just close the modal
        onClose();
      } catch (error) {
        console.error('Error snoozing alert:', error);
      }
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={handleAcknowledge}
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
              {eventId ? `Loading event...` : 'Event Details'}
            </Text>
            
            <Text style={styles.message}>
              This is a critical event that requires your immediate attention!
            </Text>
            
            <Text style={styles.instruction}>
              You must acknowledge this alert to continue.
            </Text>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.snoozeButton]}
              onPress={() => handleSnooze(5)}
            >
              <Text style={styles.actionButtonText}>Snooze 5 min</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.acknowledgeButton]}
              onPress={handleAcknowledge}
            >
              <Text style={styles.actionButtonText}>I'M READY</Text>
            </TouchableOpacity>
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
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
  },
  header: {
    backgroundColor: '#ff0000',
    paddingVertical: 20,
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    padding: 30,
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  instruction: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  snoozeButton: {
    backgroundColor: '#f0f0f0',
  },
  acknowledgeButton: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
