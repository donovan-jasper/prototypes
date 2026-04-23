import { useState, useEffect, useRef } from 'react';
import { MediaStream, MediaStreamTrack } from 'react-native-webrtc';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';

export const useCallState = () => {
  const router = useRouter();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPermissionRef = useRef<boolean>(false);
  const videoPermissionRef = useRef<boolean>(false);

  // Initialize call with permissions and streams
  const initializeCall = async (connectionId: string) => {
    try {
      // Request permissions
      await requestPermissions();

      // Start local stream
      const stream = await startLocalStream();
      setLocalStream(stream);

      // Start call timer
      startCallTimer();

      // In a real app, you would connect to signaling server here
      // and establish WebRTC connection with the remote peer
      // For this MVP, we'll simulate a remote stream after 3 seconds
      setTimeout(() => {
        setRemoteStream(stream); // In reality, this would be the remote stream
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize call');
    }
  };

  const requestPermissions = async () => {
    try {
      // Request audio permission
      const audioStatus = await Audio.requestPermissionsAsync();
      audioPermissionRef.current = audioStatus.granted;

      // Request camera permission
      const cameraStatus = await Audio.requestPermissionsAsync(); // Note: In a real app, you'd use Camera.requestPermissionsAsync()
      videoPermissionRef.current = cameraStatus.granted;

      if (!audioPermissionRef.current || !videoPermissionRef.current) {
        throw new Error('Microphone and camera permissions are required for calls');
      }
    } catch (err) {
      throw new Error('Failed to get permissions');
    }
  };

  const startLocalStream = async (): Promise<MediaStream> => {
    try {
      // In a real app, you would use react-native-webrtc to get the stream
      // For this MVP, we'll create a mock stream
      const mockStream = {
        toURL: () => 'mock-stream-url',
        getVideoTracks: () => [{ enabled: true } as MediaStreamTrack],
        getAudioTracks: () => [{ enabled: true } as MediaStreamTrack],
      } as unknown as MediaStream;

      return mockStream;
    } catch (err) {
      throw new Error('Failed to start local stream');
    }
  };

  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const toggleMute = () => {
    if (!localStream) return;

    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length > 0) {
      audioTracks[0].enabled = !audioTracks[0].enabled;
      setIsMuted(!audioTracks[0].enabled);
    }
  };

  const toggleCamera = () => {
    if (!localStream) return;

    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length > 0) {
      videoTracks[0].enabled = !videoTracks[0].enabled;
      setIsCameraOn(videoTracks[0].enabled);
    }
  };

  const switchCamera = () => {
    // In a real app, you would implement camera switching here
    console.log('Switching camera');
  };

  const endCall = () => {
    // Clean up streams and timers
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }

    router.back();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, []);

  return {
    localStream,
    remoteStream,
    isMuted,
    isCameraOn,
    callDuration,
    error,
    toggleMute,
    toggleCamera,
    switchCamera,
    endCall,
    initializeCall,
  };
};
