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
import { acknowledgeAlert, dismissAlert } from '../../services/notifications/notificationService';

const { width, height } = Dimensions.get('window');

export default function FullScreenAlert({ visible, eventId, notificationId, onClose }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const [eventDetails, setEventDetails] = useState(null);
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);
  const vibrateIntervalRef = useRef(null);

  useEffect(() => {
    if (visible && eventId) {
      loadEventDetails();

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

      Vibration.vibrate([100, 200, 100, 200, 100]);

      vibrateIntervalRef.current = setInterval(() => {
        Vibration.vibrate([100, 200, 100]);
      }, 3000);

      return () => {
        if (vibrateIntervalRef.current) {
          clearInterval(vibrateIntervalRef.current);
        }
        Vibration.cancel();
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.8);
        setShowSnoozeOptions(false);
      };
    } else if (!visible) {
      if (vibrateIntervalRef.current) {
        clearInterval(vibrateIntervalRef.current);
        vibrateIntervalRef.current = null;
      }
      Vibration.cancel();
      setShowSnoozeOptions(false);
    }
  }, [visible, eventId, fadeAnim, scaleAnim]);

  const loadEventDetails = async () => {
    try {
      const event = await getEventById(eventId);
      setEventDetails(event);
    } catch (error) {
      console.error('Error loading event details:', error);
      setEventDetails({ title: 'Unknown Event' });
    }
  };

  const handleAcknowledge = async () => {
    if (eventId && notificationId) {
      try {
        await acknowledgeAlert(notificationId, eventId);
        await dismissAlert(eventId); // Dismiss all scheduled notifications for the event
        onClose();
      } catch (error) {
        console.error('Error acknowledging alert:', error);
        onClose();
      }
    } else {
      console.warn('Cannot acknowledge alert: Missing eventId or notificationId.');
      onClose();
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
            <Text style={styles.headerText}>Vigil Alert</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.eventTitle}>{eventDetails?.title}</Text>
            <Text style={styles.eventTime}>{eventDetails?.date}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.acknowledgeButton} onPress={handleAcknowledge}>
              <Text style={styles.acknowledgeButtonText}>Acknowledge</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: width * 0.8,
    height: height * 0.6,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 18,
    color: '#333',
  },
  eventTime: {
    fontSize: 16,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  acknowledgeButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  acknowledgeButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});
