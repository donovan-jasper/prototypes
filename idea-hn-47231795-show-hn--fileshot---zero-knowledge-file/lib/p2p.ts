import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as Network from 'expo-network';
import { useFileVault } from '@/hooks/useFileVault';
import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ]
};

export const useP2PTransfer = () => {
  const [isTransferring, setIsTransferring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [peerConnection, setPeerConnection] = useState(null);
  const [dataChannel, setDataChannel] = useState(null);
  const [peers, setPeers] = useState([]);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [signalingServer, setSignalingServer] = useState(null);
  const { getFile, addNewFile } = useFileVault();

  // Initialize signaling server connection
  useEffect(() => {
    const ws = new WebSocket('ws://your-signaling-server.com');
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
    };

    ws.onclose = () => {
      console.log('Disconnected from signaling server');
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleSignalingMessage = async (message) => {
    if (!peerConnection) return;

    try {
      switch (message.type) {
        case 'offer':
          await peerConnection.setRemoteDescription(new RTCSessionDescription(message));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          signalingServer.send(JSON.stringify({
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
    }
  };

  const discoverPeers = async () => {
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
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(configuration);

    pc.oniceconnectionstatechange = () => {
      setConnectionState(pc.iceConnectionState);
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
  };

  const setupDataChannel = (channel) => {
    let receivedData = [];
    let fileName = '';
    let fileSize = 0;

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
        // Handle file data
        receivedData.push(event.data);
        const currentProgress = Math.min(
          Math.round((receivedData.length * 16384 / fileSize) * 100),
          100
        );
        setProgress(currentProgress);

        if (receivedData.length * 16384 >= fileSize) {
          // File transfer complete
          const fileData = new Blob(receivedData);
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              await addNewFile(fileName, reader.result);
              setIsTransferring(false);
              setConnectionState('completed');
              Alert.alert('Success', 'File received successfully');
            } catch (error) {
              setConnectionState('failed');
              Alert.alert('Error', 'Failed to save file');
            }
          };
          reader.readAsDataURL(fileData);
        }
      }
    };

    channel.onclose = () => {
      console.log('Data channel closed');
      setIsTransferring(false);
    };
  };

  const sendFileP2P = async (fileId, peerId) => {
    setIsTransferring(true);
    setProgress(0);
    setConnectionState('connecting');

    try {
      const file = await getFile(fileId);
      const pc = createPeerConnection();
      const channel = pc.createDataChannel('fileTransfer');

      setupDataChannel(channel);
      setDataChannel(channel);

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer to signaling server
      if (signalingServer) {
        signalingServer.send(JSON.stringify({
          type: 'offer',
          sdp: offer.sdp,
          to: peerId
        }));
      }

      // Send metadata first
      const metadata = {
        name: file.name,
        size: file.size
      };
      channel.send(JSON.stringify(metadata));

      // Send file in chunks
      const chunkSize = 16384; // 16KB chunks
      const totalChunks = Math.ceil(file.size / chunkSize);
      let sentChunks = 0;

      const sendChunk = () => {
        if (sentChunks >= totalChunks) {
          setProgress(100);
          setIsTransferring(false);
          setConnectionState('completed');
          Alert.alert('Success', `File sent to ${peerId}`);
          return;
        }

        const start = sentChunks * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.data.slice(start, end);

        if (channel.readyState === 'open') {
          channel.send(chunk);
          sentChunks++;

          // Update progress
          const currentProgress = Math.min(
            Math.round((sentChunks / totalChunks) * 100),
            100
          );
          setProgress(currentProgress);

          // Continue sending next chunk after a small delay
          setTimeout(sendChunk, 10);
        } else {
          setTimeout(sendChunk, 100);
        }
      };

      // Start sending chunks
      sendChunk();

    } catch (error) {
      console.error('P2P transfer error:', error);
      setIsTransferring(false);
      setConnectionState('failed');
      Alert.alert('Error', 'Failed to send file');
    }
  };

  const receiveFileP2P = async (peerId) => {
    setIsTransferring(true);
    setProgress(0);
    setConnectionState('connecting');

    try {
      const pc = createPeerConnection();
      // The data channel will be created by the remote peer
      // We'll handle it in the ondatachannel callback
    } catch (error) {
      console.error('P2P receive error:', error);
      setIsTransferring(false);
      setConnectionState('failed');
      Alert.alert('Error', 'Failed to receive file');
    }
  };

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
