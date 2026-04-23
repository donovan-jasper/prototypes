import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Video } from 'expo-av';
import { Audio } from 'expo-av';
import { useCallState } from '../../hooks/useCallState';
import CallControls from '../../components/CallControls';

export default function CallScreen() {
  const { connectionId } = useLocalSearchParams();
  const router = useRouter();
  const {
    localStream,
    remoteStream,
    isMuted,
    isCameraOn,
    callDuration,
    toggleMute,
    toggleCamera,
    switchCamera,
    endCall,
    initializeCall,
    error
  } = useCallState();

  const [callStatus, setCallStatus] = useState('Connecting...');
  const localVideoRef = useRef<Video>(null);
  const remoteVideoRef = useRef<Video>(null);

  useEffect(() => {
    initializeCall(connectionId as string);

    return () => {
      endCall();
    };
  }, [connectionId]);

  useEffect(() => {
    if (error) {
      Alert.alert('Call Error', error, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [error]);

  useEffect(() => {
    if (localStream && remoteStream) {
      setCallStatus('Connected');
    } else if (localStream) {
      setCallStatus('Waiting for connection...');
    }
  }, [localStream, remoteStream]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Remote Video */}
      <View style={styles.videoContainer}>
        {remoteStream ? (
          <Video
            ref={remoteVideoRef}
            style={styles.video}
            source={{ uri: remoteStream.toURL() }}
            resizeMode="cover"
            shouldPlay
            isMuted={false}
            useNativeControls={false}
          />
        ) : (
          <View style={[styles.video, styles.placeholder]}>
            <Text style={styles.placeholderText}>{callStatus}</Text>
          </View>
        )}
      </View>

      {/* Local Video (small preview) */}
      <View style={styles.localVideoContainer}>
        {localStream && isCameraOn ? (
          <Video
            ref={localVideoRef}
            style={styles.localVideo}
            source={{ uri: localStream.toURL() }}
            resizeMode="cover"
            shouldPlay
            isMuted
            useNativeControls={false}
          />
        ) : (
          <View style={[styles.localVideo, styles.placeholder]}>
            <Text style={styles.placeholderText}>You</Text>
          </View>
        )}
      </View>

      {/* Call Controls */}
      <CallControls
        isMuted={isMuted}
        isCameraOn={isCameraOn}
        onMuteToggle={toggleMute}
        onCameraToggle={toggleCamera}
        onSwitchCamera={switchCamera}
        onEndCall={endCall}
      />

      {/* Call Duration */}
      <View style={styles.durationContainer}>
        <Text style={styles.durationText}>{formatDuration(callDuration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  localVideoContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 20,
    right: 20,
    width: 120,
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 16,
  },
  durationContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 20 : 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  durationText: {
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
});
