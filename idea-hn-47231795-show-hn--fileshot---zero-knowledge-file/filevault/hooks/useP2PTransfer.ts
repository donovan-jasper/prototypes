import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as Network from 'expo-network';
import { useFileVault } from './useFileVault';
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
  const { getFile, addNewFile } = useFileVault();

  const discoverPeers = async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      if (networkState.isConnected && networkState.isInternetReachable) {
        // Simulate peer discovery
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
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // In a real app, send this to the remote peer
        console.log('ICE candidate:', event.candidate);
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

      // In a real implementation, you would send the offer to the peer
      // and handle the answer and ICE candidates

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
          setProgress(Math.round((sentChunks / totalChunks) * 100));
        }

        setTimeout(sendChunk, 50);
      };

      sendChunk();

    } catch (error) {
      console.error('Transfer error:', error);
      setConnectionState('failed');
      Alert.alert('Error', error.message);
      setIsTransferring(false);
    }
  };

  const receiveFileP2P = async (peerId) => {
    setIsTransferring(true);
    setProgress(0);
    setConnectionState('connecting');

    try {
      const pc = createPeerConnection();

      // In a real implementation, you would receive the offer from the peer
      // and set the remote description

      // For this example, we'll just wait for the data channel to open
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (dataChannel && dataChannel.readyState === 'open') {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });

    } catch (error) {
      console.error('Receive error:', error);
      setConnectionState('failed');
      Alert.alert('Error', error.message);
      setIsTransferring(false);
      throw error;
    }
  };

  const closeConnection = () => {
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    if (dataChannel) {
      dataChannel.close();
      setDataChannel(null);
    }
    setIsTransferring(false);
    setConnectionState('disconnected');
  };

  return {
    isTransferring,
    progress,
    peers,
    connectionState,
    discoverPeers,
    sendFileP2P,
    receiveFileP2P,
    closeConnection
  };
};
