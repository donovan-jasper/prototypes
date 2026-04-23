import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { insertSessionReport } from '../lib/database';
import { RTCPeerConnection, RTCView, mediaDevices, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';

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
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const cameraRef = useRef<Camera>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const signalingServerUrl = 'ws://localhost:8080'; // Mock signaling server

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      if (status === 'granted') {
        await setupLocalStream();
        await setupPeerConnection();
      }
    })();

    // Start call duration timer
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (peerConnection) {
        peerConnection.close();
      }
      if (localStream) {
        localStream.getTracks().forEach((track: any) => track.stop());
      }
    };
  }, []);

  const setupLocalStream = async () => {
    try {
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: 640,
          height: 480,
          frameRate: 30,
          facingMode: 'user'
        }
      });
      setLocalStream(stream);
    } catch (error) {
      console.error('Error getting local stream:', error);
      Alert.alert('Error', 'Could not access camera/microphone');
    }
  };

  const setupPeerConnection = async () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add TURN server configuration here for production
      ]
    };

    const pc = new RTCPeerConnection(configuration);
    setPeerConnection(pc);

    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach((track: any) => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      setIsConnecting(false);
    };

    // ICE candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Send candidate to signaling server
        console.log('Sending ICE candidate:', event.candidate);
      }
    };

    // Connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'failed') {
        Alert.alert('Connection Error', 'Failed to connect to peer');
      }
    };

    // Create and send offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    console.log('Created offer:', offer);

    // In a real app, you would send this offer to the signaling server
    // and receive an answer from the remote peer
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (peerConnection) {
      peerConnection.close();
    }
    if (localStream) {
      localStream.getTracks().forEach((track: any) => track.stop());
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
        {remoteStream ? (
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.remoteVideo}
            objectFit="cover"
          />
        ) : (
          <View style={styles.remoteVideoPlaceholder}>
            <Text style={styles.placeholderText}>Waiting for peer...</Text>
          </View>
        )}

        <View style={styles.localVideoContainer}>
          {isCameraOn && localStream ? (
            <RTCView
              streamURL={localStream.toURL()}
              style={styles.localVideo}
              objectFit="cover"
              mirror={true}
            />
          ) : (
            <View style={[styles.localVideo, styles.cameraOff]}>
              <Text style={styles.cameraOffText}>Camera Off</Text>
            </View>
          )}
        </View>
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
  remoteVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
  remoteVideoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'white',
    fontSize: 16,
  },
  localVideoContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 120,
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
  },
  localVideo: {
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
    fontSize: 12,
  },
  peerInfo: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 4,
  },
  peerName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  endCallButton: {
    backgroundColor: '#FF3B30',
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
    fontWeight: 'bold',
  },
  safetyButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.7)',
    padding: 10,
    borderRadius: 20,
  },
  connectingText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default VideoCall;
