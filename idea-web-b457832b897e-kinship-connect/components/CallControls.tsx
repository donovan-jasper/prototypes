import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CallControlsProps {
  isMuted: boolean;
  isCameraOn: boolean;
  onMuteToggle: () => void;
  onCameraToggle: () => void;
  onSwitchCamera: () => void;
  onEndCall: () => void;
}

const CallControls: React.FC<CallControlsProps> = ({
  isMuted,
  isCameraOn,
  onMuteToggle,
  onCameraToggle,
  onSwitchCamera,
  onEndCall,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.controlButton} onPress={onMuteToggle}>
        <Ionicons
          name={isMuted ? 'mic-off' : 'mic'}
          size={24}
          color={isMuted ? '#ff3b30' : '#fff'}
        />
        <Text style={[styles.buttonText, isMuted && styles.mutedText]}>
          {isMuted ? 'Unmute' : 'Mute'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.controlButton} onPress={onCameraToggle}>
        <Ionicons
          name={isCameraOn ? 'videocam' : 'videocam-off'}
          size={24}
          color={isCameraOn ? '#fff' : '#ff3b30'}
        />
        <Text style={[styles.buttonText, !isCameraOn && styles.mutedText]}>
          {isCameraOn ? 'Camera On' : 'Camera Off'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.controlButton} onPress={onSwitchCamera}>
        <Ionicons name="camera-reverse" size={24} color="#fff" />
        <Text style={styles.buttonText}>Flip</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.controlButton, styles.endCallButton]} onPress={onEndCall}>
        <Ionicons name="call" size={24} color="#fff" />
        <Text style={styles.buttonText}>End</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  controlButton: {
    alignItems: 'center',
    padding: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  mutedText: {
    color: '#ff3b30',
  },
  endCallButton: {
    backgroundColor: '#ff3b30',
    borderRadius: 30,
    padding: 15,
  },
});

export default CallControls;
