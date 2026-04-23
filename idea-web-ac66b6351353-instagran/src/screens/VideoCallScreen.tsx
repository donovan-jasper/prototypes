import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { RTCView, mediaDevices, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

type VideoCallScreenRouteProp = RouteProp<RootStackParamList, 'VideoCall'>;
type VideoCallScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VideoCall'>;

type Props = {
  route: VideoCallScreenRouteProp;
  navigation: VideoCallScreenNavigationProp;
};

const VideoCallScreen = ({ route, navigation }: Props) => {
  const { userId, matchedUserId, eventId } = route.params;
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    startLocalStream();
    setupPeerConnection();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track: any) => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };
  }, []);

  const startLocalStream = async () => {
    try {
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          mandatory: {
            minWidth: 500,
            minHeight: 300,
            minFrameRate: 30,
          },
        },
      });
      setLocalStream(stream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      Alert.alert('Error', 'Could not access camera/microphone');
    }
  };

  const setupPeerConnection = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add TURN servers if needed for production
      ],
    };

    peerConnection.current = new RTCPeerConnection(configuration);

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to the other peer via Firebase
        sendIceCandidate(event.candidate);
      }
    };

    peerConnection.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    if (localStream) {
      localStream.getTracks().forEach((track: any) => {
        peerConnection.current?.addTrack(track, localStream);
      });
    }
  };

  const sendIceCandidate = async (candidate: any) => {
    try {
      const db = getFirestore();
      const eventRef = doc(db, 'events', eventId);

      await updateDoc(eventRef, {
        iceCandidates: {
          [userId]: candidate,
        },
      });
    } catch (error) {
      console.error('Error sending ICE candidate:', error);
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
      setIsCameraOff(!isCameraOff);
    }
  };

  const endCall = async () => {
    try {
      const db = getFirestore();
      const eventRef = doc(db, 'events', eventId);

      await updateDoc(eventRef, {
        status: 'completed',
        endTime: new Date().toISOString(),
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error ending call:', error);
      Alert.alert('Error', 'Could not end call properly');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        {remoteStream ? (
          <RTCView streamURL={remoteStream.toURL()} style={styles.remoteVideo} />
        ) : (
          <View style={styles.remoteVideoPlaceholder}>
            <Text style={styles.placeholderText}>Waiting for connection...</Text>
          </View>
        )}

        {localStream && (
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.localVideo}
            mirror={true}
            objectFit="cover"
          />
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
          <Text style={styles.controlButtonText}>
            {isMuted ? 'Unmute' : 'Mute'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={toggleCamera}>
          <Text style={styles.controlButtonText}>
            {isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.controlButton, styles.endCallButton]} onPress={endCall}>
          <Text style={[styles.controlButtonText, styles.endCallText]}>End Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 16,
  },
  localVideo: {
    position: 'absolute',
    width: 120,
    height: 160,
    bottom: 80,
    right: 20,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
    backgroundColor: '#000',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#111',
  },
  controlButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 25,
    minWidth: 80,
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  endCallButton: {
    backgroundColor: '#FF3B30',
  },
  endCallText: {
    fontWeight: 'bold',
  },
});

export default VideoCallScreen;
