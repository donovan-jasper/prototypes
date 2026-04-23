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
    const ws = new WebSocket('wss://your-signaling-server.com');
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
        // In a real implementation, you would use mDNS or similar for local discovery
        // For now, we'll simulate finding peers
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
          to: 'remote-peer-id' // In a real app, this would be the specific peer ID
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
        receivedData = [];
        receivedBytes = 0;
      } else {
        // Handle file data
        receivedData.push(event.data);
        receivedBytes += event.data.byteLength;

        const currentProgress = Math.min(
          Math.round((receivedBytes / fileSize) * 100),
          100
        );
        setProgress(currentProgress);

        if (receivedBytes >= fileSize) {
          // File transfer complete
          const fileData = new Blob(receivedData);
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const fileUri = `${FileSystem.documentDirectory}${fileName}`;
              await FileSystem.writeAsStringAsync(fileUri, reader.result as string, {
                encoding: FileSystem.EncodingType.Base64
              });
              await addNewFile(fileName, fileUri);
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

      // Send metadata first
      channel.onopen = () => {
        channel.send(JSON.stringify({
          name: file.name,
          size: file.size,
          mimeType: file.mimeType
        }));

        // Read file in chunks and send
        const readChunk = async (offset: number) => {
          const chunk = await FileSystem.readAsStringAsync(file.uri, {
            encoding: FileSystem.EncodingType.Base64,
            length: CHUNK_SIZE,
            position: offset
          });

          if (chunk) {
            const buffer = Buffer.from(chunk, 'base64');
            channel.send(buffer);

            const currentProgress = Math.min(
              Math.round(((offset + CHUNK_SIZE) / file.size) * 100),
              100
            );
            setProgress(currentProgress);

            if (offset + CHUNK_SIZE < file.size) {
              setTimeout(() => readChunk(offset + CHUNK_SIZE), 0);
            } else {
              setConnectionState('completed');
              setIsTransferring(false);
            }
          }
        };

        readChunk(0);
      };

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (signalingServer) {
        signalingServer.send(JSON.stringify({
          type: 'offer',
          sdp: offer.sdp,
          to: peerId
        }));
      }
    } catch (error) {
      console.error('Send file error:', error);
      setConnectionState('failed');
      setIsTransferring(false);
      Alert.alert('Error', 'Failed to send file');
    }
  }, [createPeerConnection, getFile, signalingServer]);

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

      // Data channel will be created by the sender
    } catch (error) {
      console.error('Receive file error:', error);
      setConnectionState('failed');
      setIsTransferring(false);
      Alert.alert('Error', 'Failed to receive file');
    }
  }, [createPeerConnection]);

  return {
    isTransferring,
    progress,
    peers,
    connectionState,
    discoverPeers,
    sendFileP2P,
    receiveFileP2P
  };
};
