import { useState, useEffect } from 'react';
import { AV } from 'expo-av';

export const useCallState = (connectionId) => {
  const [callState, setCallState] = useState('idle');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const setupCall = async () => {
      try {
        const { status } = await AV.requestPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access camera and microphone was denied');
          return;
        }

        // Mock call setup
        setCallState('connecting');
        setTimeout(() => {
          setCallState('connected');
          setLocalStream('local-stream');
          setRemoteStream('remote-stream');
        }, 2000);
      } catch (err) {
        setError(err);
      }
    };

    setupCall();

    return () => {
      // Cleanup
    };
  }, [connectionId]);

  return { callState, localStream, remoteStream, error };
};
