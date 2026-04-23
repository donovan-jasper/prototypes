import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { RTCView, mediaDevices } from 'react-native-webrtc';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

type VideoCallRouteProp = RouteProp<RootStackParamList, 'VideoCall'>;
type VideoCallNavigationProp = StackNavigationProp<RootStackParamList, 'VideoCall'>;

type Props = {
  route: VideoCallRouteProp;
  navigation: VideoCallNavigationProp;
};

const VideoCall = ({ route, navigation }: Props) => {
  const { userId, matchedUserId, eventId } = route.params;
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    // Initialize local media stream
    const initLocalStream = async () => {
      try {
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setLocalStream(stream);

        // Initialize peer connection
        const configuration = {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            // Add TURN server configuration if needed
          ],
        };

        peerConnection.current = new RTCPeerConnection(configuration);

        // Add local stream to peer connection
        stream.getTracks().forEach(track => {
          peerConnection.current?.addTrack(track, stream);
        });

        // Handle remote stream
        peerConnection.current.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
        };

        // Setup signaling with Firebase
        setupSignaling();
      } catch (error) {
        console.error('Error initializing media stream:', error);
        Alert.alert('Error', 'Could not access camera/microphone');
      }
    };

    initLocalStream();

    return () => {
      // Clean up
      if (localStream) {
        localStream.getTracks().forEach((track: any) => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };
  }, []);

  const setupSignaling = () => {
    const db = getFirestore();
    const eventRef = doc(db, 'events', eventId);

    // Listen for signaling messages
    const unsubscribe = onSnapshot(eventRef, (doc) => {
      const data = doc.data();
      if (data?.offer && peerConnection.current) {
        handleOffer(data.offer);
      } else if (data?.answer && peerConnection.current) {
        handleAnswer(data.answer);
      } else if (data?.iceCandidate && peerConnection.current) {
        handleIceCandidate(data.iceCandidate);
      }
    });

    return unsubscribe;
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnection.current) return;

    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    // Send answer to Firebase
    const db = getFirestore();
    const eventRef = doc(db, 'events', eventId);
    await eventRef.update({
      answer: answer.toJSON(),
    });
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnection.current) return;
    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!peerConnection.current) return;
    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
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

  const endCall = () => {
    navigation.goBack();
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
          <RTCView streamURL={localStream.toURL()} style={styles.localVideo} />
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
          <Text style={styles.controlText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={toggleCamera}>
          <Text style={styles.controlText}>{isCameraOff ? 'Camera On' : 'Camera Off'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.controlButton, styles.endButton]} onPress={endCall}>
          <Text style={[styles.controlText, styles.endButtonText]}>End Call</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
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
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#111',
  },
  controlButton: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: {
    color: '#fff',
    fontSize: 14,
  },
  endButton: {
    backgroundColor: '#FF3B30',
  },
  endButtonText: {
    fontWeight: 'bold',
  },
});

export default VideoCall;
