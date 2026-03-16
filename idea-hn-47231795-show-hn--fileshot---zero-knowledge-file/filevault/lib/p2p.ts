import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as Network from 'expo-network';
import { useFileVault } from '@/hooks/useFileVault';

export const useP2PTransfer = () => {
  const [isTransferring, setIsTransferring] = useState(false);
  const [progress, setProgress] = useState(0);
  const { getFile } = useFileVault();

  const discoverPeers = async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      if (networkState.isConnected && networkState.isInternetReachable) {
        // Implement peer discovery logic here
        // This is a simplified example
        return ['peer1', 'peer2'];
      }
      return [];
    } catch (error) {
      console.error('Discovery error:', error);
      return [];
    }
  };

  const sendFileP2P = async (fileId, peerId) => {
    setIsTransferring(true);
    setProgress(0);

    try {
      const file = await getFile(fileId);

      // Simulate transfer progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setProgress(i);
      }

      Alert.alert('Success', `File sent to ${peerId}`);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsTransferring(false);
    }
  };

  const receiveFileP2P = async (peerId) => {
    setIsTransferring(true);
    setProgress(0);

    try {
      // Simulate receiving file
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setProgress(i);
      }

      Alert.alert('Success', `File received from ${peerId}`);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsTransferring(false);
    }
  };

  return {
    isTransferring,
    progress,
    discoverPeers,
    sendFileP2P,
    receiveFileP2P,
  };
};
