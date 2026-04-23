import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { insertSessionReport } from '../lib/database';

interface VideoCallProps {
  sessionId: string;
  peerName?: string;
  onEndCall: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ sessionId, peerName, onEndCall }) => {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const cameraRef = useRef<Camera>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    // Simulate connection delay
    const connectionTimer = setTimeout(() => {
      setIsConnecting(false);
    }, 3000);

    // Start call duration timer
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      clearTimeout(connectionTimer);
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onEndCall();
  };

  const handleReportCall = async () => {
    try {
      await insertSessionReport({
        id: `report_${Date.now()}`,
        sessionId,
        timestamp: Date.now(),
        reason: 'User initiated report',
        status: 'pending'
      });
      Alert.alert('Report Submitted', 'Your report has been submitted to moderators.');
      handleEndCall();
    } catch (error) {
      console.error('Error saving report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  if (isConnecting) {
    return (
      <View style={styles.container}>
        <Text style={styles.connectingText}>Connecting to {peerName || 'peer'}...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        {isCameraOn ? (
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={Camera.Constants.Type.front}
            ratio="16:9"
          />
        ) : (
          <View style={[styles.camera, styles.cameraOff]}>
            <Text style={styles.cameraOffText}>Camera Off</Text>
          </View>
        )}
      </View>

      {peerName && (
        <View style={styles.peerInfo}>
          <Text style={styles.peerName}>{peerName}</Text>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setIsMuted(!isMuted)}
        >
          <MaterialIcons
            name={isMuted ? 'mic-off' : 'mic'}
            size={24}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={handleEndCall}
        >
          <MaterialIcons name="call-end" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setIsCameraOn(!isCameraOn)}
        >
          <MaterialIcons
            name={isCameraOn ? 'videocam' : 'videocam-off'}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.durationContainer}>
        <Text style={styles.durationText}>{formatDuration(callDuration)}</Text>
      </View>

      <TouchableOpacity
        style={styles.safetyButton}
        onPress={handleReportCall}
      >
        <MaterialIcons name="report" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  cameraOff: {
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraOffText: {
    color: 'white',
    fontSize: 18,
  },
  peerInfo: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  peerName: {
    color: 'white',
    fontSize: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallButton: {
    backgroundColor: '#ff3b30',
  },
  durationContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  durationText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  safetyButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default VideoCall;
