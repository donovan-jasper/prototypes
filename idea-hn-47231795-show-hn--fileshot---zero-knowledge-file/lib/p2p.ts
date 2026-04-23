import { useEffect, useState, useCallback, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import * as Network from 'expo-network';
import * as FileSystem from 'expo-file-system';
import { useFileVault } from '@/hooks/useFileVault';
import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, RTCDataChannel } from 'react-native-webrtc';
import { Buffer } from 'buffer';

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
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const SIGNALING_SERVER_URL = 'wss://your-signaling-server.com'; // Replace with your actual signaling server URL

export const useP2PTransfer = () => {
  const [isTransferring, setIsTransferring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const [peers, setPeers] = useState<string[]>([]);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'completed' | 'failed'>('disconnected');
  const [retryCount, setRetryCount] = useState(0);
  const [signalingSocket, setSignalingSocket] = useState<WebSocket | null>(null);
  const { getFile, addNewFile } = useFileVault();
  const transferTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize signaling server connection
  useEffect(() => {
    const socket = new WebSocket(SIGNALING_SERVER_URL);

    socket.onopen = () => {
      console.log('Connected to signaling server');
      setSignalingSocket(socket);
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleSignalingMessage(message);
    };

    socket.onclose = () => {
      console.log('Disconnected from signaling server');
      setSignalingSocket(null);
    };

    socket.onerror = (error) => {
      console.error('Signaling server error:', error);
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  // Initialize P2P connection
  useEffect(() => {
    const initializeP2P = async () => {
      try {
        const pc = new RTCPeerConnection(configuration);
        setupPeerConnection(pc);
        setPeerConnection(pc);

        // Create data channel if we're the sender
        const channel = pc.createDataChannel('fileTransfer');
        setupDataChannel(channel);
        setDataChannel(channel);
      } catch (error) {
        console.error('P2P initialization error:', error);
        setConnectionState('failed');
      }
    };

    initializeP2P();

    return () => {
      if (peerConnection) {
        peerConnection.close();
      }
      if (transferTimeout.current) {
        clearTimeout(transferTimeout.current);
      }
    };
  }, []);

  const setupPeerConnection = (pc: RTCPeerConnection) => {
    pc.oniceconnectionstatechange = () => {
      setConnectionState(pc.iceConnectionState as any);
      if (pc.iceConnectionState === 'failed') {
        handleConnectionFailure();
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && signalingSocket) {
        signalingSocket.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate
        }));
      }
    };

    pc.ondatachannel = (event) => {
      const channel = event.channel;
      setDataChannel(channel);
      setupDataChannel(channel);
    };
  };

  const handleSignalingMessage = (message: any) => {
    switch (message.type) {
      case 'offer':
        handleOffer(message);
        break;
      case 'answer':
        handleAnswer(message);
        break;
      case 'ice-candidate':
        handleIceCandidate(message);
        break;
      case 'peer-list':
        setPeers(message.peers);
        break;
    }
  };

  const handleOffer = async (message: any) => {
    if (!peerConnection) return;

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      if (signalingSocket) {
        signalingSocket.send(JSON.stringify({
          type: 'answer',
          sdp: answer
        }));
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (message: any) => {
    if (!peerConnection) return;

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (message: any) => {
    if (!peerConnection) return;

    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  };

  const handleConnectionFailure = () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
      setConnectionState('connecting');
      transferTimeout.current = setTimeout(() => {
        // Retry connection logic would go here
        console.log(`Retrying connection (attempt ${retryCount + 1})`);
      }, RETRY_DELAY);
    } else {
      setConnectionState('failed');
      Alert.alert('Connection Failed', 'Could not establish connection with peer. Falling back to HTTP transfer.');
    }
  };

  const setupDataChannel = (channel: RTCDataChannel) => {
    let receivedData: ArrayBuffer[] = [];
    let fileName = '';
    let fileSize = 0;
    let receivedBytes = 0;
    let totalChunks = 0;
    let receivedChunks = 0;

    channel.onopen = () => {
      console.log('Data channel opened');
      setConnectionState('connected');
    };

    channel.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        // Handle metadata
        const metadata = JSON.parse(event.data);
        if (metadata.type === 'fileInfo') {
          fileName = metadata.name;
          fileSize = metadata.size;
          totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
          console.log(`Receiving file: ${fileName}, size: ${fileSize} bytes, chunks: ${totalChunks}`);
        } else if (metadata.type === 'ack') {
          console.log('Received acknowledgment for chunk:', metadata.chunkId);
        }
      } else {
        // Handle file data chunks
        receivedData.push(event.data);
        receivedBytes += event.data.byteLength;
        receivedChunks++;

        // Calculate progress
        const newProgress = Math.min(100, Math.floor((receivedBytes / fileSize) * 100));
        setProgress(newProgress);

        // Send acknowledgment
        if (channel.readyState === 'open') {
          channel.send(JSON.stringify({
            type: 'ack',
            chunkId: receivedChunks - 1
          }));
        }

        // If we've received all chunks, save the file
        if (receivedChunks === totalChunks) {
          try {
            const fileData = Buffer.concat(receivedData.map(chunk => Buffer.from(chunk)));
            const fileUri = FileSystem.documentDirectory + fileName;

            await FileSystem.writeAsStringAsync(fileUri, fileData.toString('base64'), {
              encoding: FileSystem.EncodingType.Base64
            });

            // Add to vault
            await addNewFile({
              name: fileName,
              size: fileSize,
              path: fileUri,
              encrypted: true
            });

            setConnectionState('completed');
            setIsTransferring(false);
          } catch (error) {
            console.error('Error saving received file:', error);
            setConnectionState('failed');
          }
        }
      }
    };

    channel.onclose = () => {
      console.log('Data channel closed');
    };

    channel.onerror = (error) => {
      console.error('Data channel error:', error);
      setConnectionState('failed');
    };
  };

  const discoverPeers = async (): Promise<string[]> => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected || !networkState.isInternetReachable) {
        return [];
      }

      // In a real implementation, you would use mDNS/Bonjour here
      // For this example, we'll simulate finding peers
      if (signalingSocket) {
        signalingSocket.send(JSON.stringify({
          type: 'discover-peers'
        }));
      }

      return peers;
    } catch (error) {
      console.error('Peer discovery error:', error);
      return [];
    }
  };

  const sendFileP2P = async (fileId: string, peerId: string) => {
    if (!peerConnection || !dataChannel) {
      console.error('Peer connection not established');
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

      // Read file data
      const fileData = await FileSystem.readAsStringAsync(file.path, {
        encoding: FileSystem.EncodingType.Base64
      });
      const buffer = Buffer.from(fileData, 'base64');

      // Send file metadata first
      if (dataChannel.readyState === 'open') {
        dataChannel.send(JSON.stringify({
          type: 'fileInfo',
          name: file.name,
          size: buffer.length
        }));
      }

      // Split file into chunks and send
      const totalChunks = Math.ceil(buffer.length / CHUNK_SIZE);
      let sentChunks = 0;

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, buffer.length);
        const chunk = buffer.slice(start, end);

        if (dataChannel.readyState === 'open') {
          dataChannel.send(chunk);
          sentChunks++;

          // Update progress
          const newProgress = Math.min(100, Math.floor((sentChunks / totalChunks) * 100));
          setProgress(newProgress);
        } else {
          throw new Error('Data channel closed');
        }
      }

      setConnectionState('completed');
    } catch (error) {
      console.error('Error sending file:', error);
      setConnectionState('failed');
    } finally {
      setIsTransferring(false);
    }
  };

  const receiveFileP2P = async (peerId: string) => {
    // The receiving logic is handled in the data channel setup
    setIsTransferring(true);
    setConnectionState('connecting');
  };

  const cancelTransfer = () => {
    if (peerConnection) {
      peerConnection.close();
    }
    if (dataChannel) {
      dataChannel.close();
    }
    setIsTransferring(false);
    setConnectionState('disconnected');
    setProgress(0);
  };

  return {
    isTransferring,
    progress,
    connectionState,
    peers,
    discoverPeers,
    sendFileP2P,
    receiveFileP2P,
    cancelTransfer
  };
};
