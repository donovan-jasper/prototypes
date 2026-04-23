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

export const useP2PTransfer = () => {
  const [isTransferring, setIsTransferring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const [peers, setPeers] = useState<string[]>([]);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'completed' | 'failed'>('disconnected');
  const [retryCount, setRetryCount] = useState(0);
  const { getFile, addNewFile } = useFileVault();
  const transferTimeout = useRef<NodeJS.Timeout | null>(null);

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
      if (event.candidate) {
        // In a real implementation, we would send this to the remote peer
        // via signaling server or broadcast
        console.log('ICE candidate:', event.candidate);
      }
    };

    pc.ondatachannel = (event) => {
      const channel = event.channel;
      setDataChannel(channel);
      setupDataChannel(channel);
    };
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
            const fileUri = await saveReceivedFile(fileName, receivedData);
            await addNewFile({
              name: fileName,
              size: fileSize,
              uri: fileUri,
              isEncrypted: true
            });
            setConnectionState('completed');
          } catch (error) {
            console.error('Error saving received file:', error);
            setConnectionState('failed');
          }
        }
      }
    };

    channel.onclose = () => {
      console.log('Data channel closed');
      if (connectionState !== 'completed') {
        setConnectionState('failed');
      }
    };

    channel.onerror = (error) => {
      console.error('Data channel error:', error);
      setConnectionState('failed');
    };
  };

  const saveReceivedFile = async (fileName: string, chunks: ArrayBuffer[]) => {
    const fileUri = `${FileSystem.documentDirectory}vault/${Date.now()}_${fileName}`;
    const fileData = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));

    await FileSystem.writeAsStringAsync(fileUri, fileData.toString('base64'), {
      encoding: FileSystem.EncodingType.Base64
    });

    return fileUri;
  };

  const discoverPeers = useCallback(async (): Promise<string[]> => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      if (networkState.isConnected && networkState.isInternetReachable) {
        // In a real implementation, we would use mDNS or broadcast UDP
        // For now, we'll simulate discovery
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

  const sendFileP2P = useCallback(async (fileId: string, peerId: string) => {
    if (!peerConnection || !dataChannel || dataChannel.readyState !== 'open') {
      console.error('Peer connection or data channel not ready');
      setConnectionState('failed');
      return;
    }

    setIsTransferring(true);
    setConnectionState('connecting');
    setProgress(0);

    try {
      const file = await getFile(fileId);
      if (!file) {
        throw new Error('File not found');
      }

      // Read file in chunks
      const fileInfo = {
        type: 'fileInfo',
        name: file.name,
        size: file.size
      };

      // Send file metadata first
      dataChannel.send(JSON.stringify(fileInfo));

      // Read and send file in chunks
      const fileUri = file.uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64
      });

      const buffer = Buffer.from(fileContent, 'base64');
      const totalChunks = Math.ceil(buffer.length / CHUNK_SIZE);
      let sentChunks = 0;

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, buffer.length);
        const chunk = buffer.slice(start, end);

        // Send chunk
        dataChannel.send(chunk);

        // Update progress
        sentChunks++;
        const newProgress = Math.min(100, Math.floor((sentChunks / totalChunks) * 100));
        setProgress(newProgress);

        // Wait for acknowledgment (simplified for this example)
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      setConnectionState('completed');
    } catch (error) {
      console.error('Error sending file:', error);
      setConnectionState('failed');
    } finally {
      setIsTransferring(false);
    }
  }, [peerConnection, dataChannel, getFile]);

  const receiveFileP2P = useCallback(async (peerId: string) => {
    // The actual receiving logic is handled in the data channel setup
    setIsTransferring(true);
    setConnectionState('connecting');
    setProgress(0);

    // In a real implementation, we would initiate the connection with the peer
    // via signaling or broadcast
  }, []);

  const cancelTransfer = useCallback(() => {
    if (peerConnection) {
      peerConnection.close();
    }
    if (dataChannel) {
      dataChannel.close();
    }
    setIsTransferring(false);
    setConnectionState('disconnected');
    setProgress(0);
  }, [peerConnection, dataChannel]);

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
