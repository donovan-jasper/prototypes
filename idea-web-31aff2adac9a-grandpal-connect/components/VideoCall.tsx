import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, Platform } from 'react-native';
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
  const [connectionState, setConnectionState] = useState<string>('connecting');
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
      setConnectionState('connected');
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
      setConnectionState(pc.connectionState);

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

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track: any) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track: any) => {
        track.enabled = !track.enabled;
      });
      setIsCameraOn(!isCameraOn);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
        <TouchableOpacity onPress={() => Camera.requestCameraPermissionsAsync()}>
          <Text>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isConnecting ? (
        <View style={styles.connectingContainer}>
          <Text style={styles.connectingText}>Connecting to {peerName || 'peer'}...</Text>
          <Text style={styles.connectionStateText}>{connectionState}</Text>
        </View>
      ) : (
        <>
          <View style={styles.videoContainer}>
            {remoteStream ? (
              <RTCView
                streamURL={remoteStream.toURL()}
                style={styles.remoteVideo}
                objectFit="cover"
              />
            ) : (
              <View style={styles.remoteVideoPlaceholder}>
                <Text>Waiting for peer video...</Text>
              </View>
            )}

            <View style={styles.localVideoContainer}>
              {localStream && (
                <RTCView
                  streamURL={localStream.toURL()}
                  style={styles.localVideo}
                  objectFit="cover"
                  mirror={true}
                />
              )}
            </View>
          </View>

          <View style={styles.peerInfoContainer}>
            <Text style={styles.peerName}>{peerName || 'Peer'}</Text>
            <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
          </View>

          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={[styles.controlButton, isMuted && styles.mutedButton]}
              onPress={toggleMute}
            >
              <MaterialIcons
                name={isMuted ? 'mic-off' : 'mic'}
                size={24}
                color={isMuted ? 'red' : 'white'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.endCallButton}
              onPress={handleEndCall}
            >
              <MaterialIcons name="call-end" size={36} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, !isCameraOn && styles.cameraOffButton]}
              onPress={toggleCamera}
            >
              <MaterialIcons
                name={isCameraOn ? 'videocam' : 'videocam-off'}
                size={24}
                color={isCameraOn ? 'white' : 'red'}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.reportButton}
            onPress={handleReportCall}
          >
            <Text style={styles.reportButtonText}>Report</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  connectingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 10,
  },
  connectionStateText: {
    color: 'gray',
    fontSize: 16,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  remoteVideo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  remoteVideoPlaceholder: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideoContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 120,
    height: 160,
    backgroundColor: 'black',
    borderRadius: 8,
    overflow: 'hidden',
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  peerInfoContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  peerName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  callDuration: {
    color: 'white',
    fontSize: 16,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
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
  mutedButton: {
    backgroundColor: 'rgba(255,0,0,0.2)',
  },
  cameraOffButton: {
    backgroundColor: 'rgba(255,0,0,0.2)',
  },
  endCallButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    padding: 10,
    backgroundColor: 'rgba(255,0,0,0.7)',
    borderRadius: 5,
  },
  reportButtonText: {
    color: 'white',
    fontSize: 14,
  },
});

export default VideoCall;
