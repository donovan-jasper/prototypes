import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Button, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as SQLite from 'expo-sqlite';
import PremiumGate from '../components/PremiumGate';
import { textToMorse } from '../lib/morse';
import { FlashlightService } from '../lib/flashlightService';

// Initialize database
const db = SQLite.openDatabaseSync('morsemate.db');

export default function SOSScreen() {
  const [active, setActive] = useState(false);
  const [permission, setPermission] = useState<{ granted: boolean } | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [customMessage, setCustomMessage] = useState('SOS');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const cameraRef = useRef<Camera>(null);
  const flashlightService = useRef<FlashlightService | null>(null);

  useEffect(() => {
    // Initialize services
    if (cameraRef.current) {
      flashlightService.current = new FlashlightService(cameraRef);
    }

    // Check permissions and premium status
    checkPermissions();
    checkPremiumStatus();
    loadCustomMessage();
  }, []);

  const checkPermissions = async () => {
    if (flashlightService.current) {
      const granted = await flashlightService.current.checkPermissions();
      setPermission({ granted });
    }
    setLoading(false);
  };

  const checkPremiumStatus = async () => {
    // In a real app, check with your payment service
    // For demo, we'll simulate it
    setIsPremium(false);
  };

  const loadCustomMessage = async () => {
    try {
      const result = db.getFirstSync('SELECT message FROM custom_sos WHERE id = 1');
      if (result) {
        setCustomMessage(result.message);
      }
    } catch (error) {
      console.log('Error loading custom message:', error);
    }
  };

  const saveCustomMessage = async (message: string) => {
    try {
      db.runSync(
        'INSERT OR REPLACE INTO custom_sos (id, message) VALUES (1, ?)',
        [message]
      );
      setCustomMessage(message);
    } catch (error) {
      console.log('Error saving custom message:', error);
    }
  };

  const flashSOS = async () => {
    if (!permission?.granted) {
      Alert.alert('Permission required', 'Camera permission is needed to use flashlight');
      return;
    }

    if (!flashlightService.current) {
      Alert.alert('Error', 'Flashlight service not initialized');
      return;
    }

    setActive(true);

    try {
      await flashlightService.current.sendSOS(customMessage);
    } catch (error) {
      console.error('Error in flashSOS:', error);
      Alert.alert('Error', 'Failed to send SOS signal');
    } finally {
      setActive(false);
    }
  };

  const handleCustomMessage = () => {
    if (!isPremium) {
      return;
    }
    setShowCustomModal(true);
  };

  const handleSaveMessage = () => {
    if (newMessage.trim()) {
      saveCustomMessage(newMessage.trim());
      setShowCustomModal(false);
      setNewMessage('');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Hidden camera component for flashlight control */}
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        type="back"
        ratio="16:9"
      />

      <Text style={styles.title}>Emergency SOS</Text>
      <Text style={styles.warning}>⚠️ Use only in real emergencies</Text>

      <Button
        title={active ? "Signaling..." : "Send SOS"}
        onPress={flashSOS}
        disabled={active}
        color="#FF3B30"
      />

      <PremiumGate
        isPremium={isPremium}
        featureName="Custom SOS Messages"
        onUpgrade={() => setIsPremium(true)}
      />

      <Text style={styles.info}>
        This will flash SOS in Morse code using your device's flashlight.
      </Text>

      {isPremium && (
        <View style={styles.premiumSection}>
          <Text style={styles.premiumText}>Current Message: {customMessage}</Text>
          <Button
            title="Set Custom Message"
            onPress={handleCustomMessage}
            color="#007AFF"
          />
        </View>
      )}

      <Modal
        visible={showCustomModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Custom SOS Message</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your message"
              value={newMessage}
              onChangeText={setNewMessage}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowCustomModal(false)}
                color="#888"
              />
              <Button
                title="Save"
                onPress={handleSaveMessage}
                color="#007AFF"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  warning: {
    fontSize: 18,
    color: '#FF3B30',
    marginBottom: 40,
    textAlign: 'center',
  },
  info: {
    marginTop: 40,
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 20,
  },
  premiumSection: {
    marginTop: 30,
    width: '100%',
    paddingHorizontal: 20,
  },
  premiumText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
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
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
