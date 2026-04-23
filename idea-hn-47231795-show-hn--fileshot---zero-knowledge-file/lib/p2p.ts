import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Network from 'expo-network';
import * as FileSystem from 'expo-file-system';
import { useFileVault } from '@/hooks/useFileVault';
import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, RTCDataChannel } from 'react-native-webrtc';

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ]
};

const CHUNK_SIZE = 16384; // 16KB chunks

export const useP2PTransfer = () => {
  const [isTransferring, setIsTransferring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const [peers, setPeers] = useState<string[]>([]);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'completed' | 'failed'>('disconnected');
  const [signalingServer, setSignalingServer] = useState<WebSocket | null>(null);
  const { getFile, addNewFile } = useFileVault();

  // Initialize signaling server connection
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080'); // Local signaling server
    setSignalingServer(ws);

    ws.onopen = () => {
      console.log('Connected to signaling server');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleSignalingMessage(message);
    };

    ws.onerror = (error) => {
      console.error('Signaling server error:', error);
      setConnectionState('failed');
    };

    ws.onclose = () => {
      console.log('Disconnected from signaling server');
      setConnectionState('disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleSignalingMessage = useCallback(async (message: any) => {
    if (!peerConnection) return;

    try {
      switch (message.type) {
        case 'offer':
          await peerConnection.setRemoteDescription(new RTCSessionDescription(message));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          signalingServer?.send(JSON.stringify({
            type: 'answer',
            sdp: answer.sdp,
            to: message.from
          }));
          break;

        case 'answer':
          await peerConnection.setRemoteDescription(new RTCSessionDescription(message));
          break;

        case 'candidate':
          await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
          break;
      }
    } catch (error) {
      console.error('Signaling message error:', error);
      setConnectionState('failed');
    }
  }, [peerConnection, signalingServer]);

  const discoverPeers = useCallback(async (): Promise<string[]> => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      if (networkState.isConnected && networkState.isInternetReachable) {
        // Simulate mDNS discovery
        const simulatedPeers = ['device-1', 'device-2'];
        setPeers(simulatedPeers);
        return simulatedPeers;
      }
      return [];
    } catch (error) {
      console.error('Discovery error:', error);
      return [];
    }
  }, []);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(configuration);

    pc.oniceconnectionstatechange = () => {
      setConnectionState(pc.iceConnectionState as any);
      if (pc.iceConnectionState === 'failed') {
        Alert.alert('Connection Failed', 'Could not establish connection with peer');
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && signalingServer) {
        signalingServer.send(JSON.stringify({
          type: 'candidate',
          candidate: event.candidate,
          to: 'remote-peer-id'
        }));
      }
    };

    pc.ondatachannel = (event) => {
      const channel = event.channel;
      setDataChannel(channel);
      setupDataChannel(channel);
    };

    setPeerConnection(pc);
    return pc;
  }, [signalingServer]);

  const setupDataChannel = useCallback((channel: RTCDataChannel) => {
    let receivedData: ArrayBuffer[] = [];
    let fileName = '';
    let fileSize = 0;
    let receivedBytes = 0;

    channel.onopen = () => {
      console.log('Data channel opened');
      setConnectionState('connected');
    };

    channel.onmessage = (event) => {
      if (typeof event.data === 'string') {
        // Handle metadata
        const metadata = JSON.parse(event.data);
        fileName = metadata.name;
        fileSize = metadata.size;
      } else {
        // Handle file data chunks
        receivedData.push(event.data);
        receivedBytes += event.data.byteLength;
        const currentProgress = Math.floor((receivedBytes / fileSize) * 100);
        setProgress(currentProgress);

        if (receivedBytes === fileSize) {
          // File transfer complete
          const fileData = new Blob(receivedData);
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const fileUri = FileSystem.documentDirectory + fileName;
              await FileSystem.writeAsStringAsync(fileUri, reader.result as string, {
                encoding: FileSystem.EncodingType.Base64
              });
              await addNewFile({
                id: Date.now().toString(),
                name: fileName,
                size: fileSize,
                path: fileUri,
                encrypted: true
              });
              setConnectionState('completed');
              setIsTransferring(false);
            } catch (error) {
              console.error('File save error:', error);
              setConnectionState('failed');
            }
          };
          reader.readAsDataURL(fileData);
        }
      }
    };

    channel.onclose = () => {
      console.log('Data channel closed');
      setConnectionState('disconnected');
    };

    channel.onerror = (error) => {
      console.error('Data channel error:', error);
      setConnectionState('failed');
    };
  }, [addNewFile]);

  const sendFileP2P = useCallback(async (fileId: string, peerId: string) => {
    if (!peerId) {
      Alert.alert('Error', 'No peer selected');
      return;
    }

    try {
      setIsTransferring(true);
      setConnectionState('connecting');
      setProgress(0);

      const file = await getFile(fileId);
      if (!file) {
        throw new Error('File not found');
      }

      const pc = createPeerConnection();
      const channel = pc.createDataChannel('fileTransfer');
      setDataChannel(channel);
      setupDataChannel(channel);

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer to signaling server
      signalingServer?.send(JSON.stringify({
        type: 'offer',
        sdp: offer.sdp,
        to: peerId
      }));

      // Read file and send chunks
      const fileContent = await FileSystem.readAsStringAsync(file.path, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Send metadata first
      channel.send(JSON.stringify({
        name: file.name,
        size: file.size
      }));

      // Send file in chunks
      for (let i = 0; i < fileContent.length; i += CHUNK_SIZE) {
        const chunk = fileContent.slice(i, i + CHUNK_SIZE);
        channel.send(chunk);
        const currentProgress = Math.floor((i / fileContent.length) * 100);
        setProgress(currentProgress);
      }

      setProgress(100);
      setConnectionState('completed');
    } catch (error) {
      console.error('Send file error:', error);
      setConnectionState('failed');
      Alert.alert('Transfer Failed', 'Could not send file');
    } finally {
      setIsTransferring(false);
    }
  }, [createPeerConnection, setupDataChannel, getFile, signalingServer]);

  const receiveFileP2P = useCallback(async (peerId: string) => {
    if (!peerId) {
      Alert.alert('Error', 'No peer selected');
      return;
    }

    try {
      setIsTransferring(true);
      setConnectionState('connecting');
      setProgress(0);

      const pc = createPeerConnection();
      setPeerConnection(pc);

      // Wait for data channel to be created via ondatachannel event
      // The setupDataChannel will handle the actual file reception
    } catch (error) {
      console.error('Receive file error:', error);
      setConnectionState('failed');
      Alert.alert('Transfer Failed', 'Could not receive file');
    }
  }, [createPeerConnection]);

  const cancelTransfer = useCallback(() => {
    if (dataChannel) {
      dataChannel.close();
    }
    if (peerConnection) {
      peerConnection.close();
    }
    setIsTransferring(false);
    setConnectionState('disconnected');
    setProgress(0);
  }, [dataChannel, peerConnection]);

  return {
    isTransferring,
    progress,
    peers,
    connectionState,
    discoverPeers,
    sendFileP2P,
    receiveFileP2P,
    cancelTransfer
  };
};
