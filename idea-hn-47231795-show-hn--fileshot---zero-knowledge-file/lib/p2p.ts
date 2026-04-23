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
        const newProgress = Math.floor((receivedBytes / fileSize) * 100);
        setProgress(newProgress);

        if (receivedBytes === fileSize) {
          // File transfer complete
          const fileData = new Blob(receivedData);
          saveReceivedFile(fileName, fileData);
        }
      }
    };

    channel.onclose = () => {
      console.log('Data channel closed');
      setConnectionState('completed');
    };

    channel.onerror = (error) => {
      console.error('Data channel error:', error);
      setConnectionState('failed');
    };
  }, []);

  const saveReceivedFile = useCallback(async (fileName: string, fileData: Blob) => {
    try {
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, await fileData.text(), {
        encoding: FileSystem.EncodingType.Base64
      });

      // Add to vault
      await addNewFile({
        name: fileName,
        size: fileData.size,
        path: fileUri,
        encrypted: false // In real app, this would be true after decryption
      });

      setIsTransferring(false);
      setProgress(100);
    } catch (error) {
      console.error('Error saving received file:', error);
      setConnectionState('failed');
    }
  }, [addNewFile]);

  const sendFileP2P = useCallback(async (fileId: string, peerId: string) => {
    try {
      setIsTransferring(true);
      setConnectionState('connecting');

      const file = await getFile(fileId);
      if (!file) throw new Error('File not found');

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

      // Send file data in chunks
      for (let i = 0; i < fileContent.length; i += CHUNK_SIZE) {
        const chunk = fileContent.slice(i, i + CHUNK_SIZE);
        channel.send(chunk);
        const progress = Math.floor((i / fileContent.length) * 100);
        setProgress(progress);
      }

      setConnectionState('completed');
    } catch (error) {
      console.error('Error sending file:', error);
      setConnectionState('failed');
    } finally {
      setIsTransferring(false);
    }
  }, [createPeerConnection, setupDataChannel, signalingServer, getFile]);

  const receiveFileP2P = useCallback(async (peerId: string) => {
    try {
      setIsTransferring(true);
      setConnectionState('connecting');

      const pc = createPeerConnection();
      setPeerConnection(pc);

      // Wait for data channel to be created via ondatachannel event
    } catch (error) {
      console.error('Error receiving file:', error);
      setConnectionState('failed');
    }
  }, [createPeerConnection]);

  return {
    isTransferring,
    progress,
    peers,
    connectionState,
    discoverPeers,
    sendFileP2P,
    receiveFileP2P,
    peerConnection,
    dataChannel
  };
};
