import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, mediaDevices } from 'react-native-webrtc';
import { encryptMessage, decryptMessage } from './encryption';
import { getExpenses, addExpense, updateExpense, useSQLiteContext } from './database';
import { useStore } from './store';
import * as SecureStore from 'expo-secure-store';
import * as Application from 'expo-application';
import type { Expense } from './types';

interface SyncPayload {
  expenses: Expense[];
  timestamp: number;
}

interface SignalingData {
  type: 'offer' | 'answer';
  sdp: string;
  deviceId: string;
}

let peerConnection: RTCPeerConnection | null = null;
let dataChannel: RTCDataChannel | null = null;
let encryptionKey: string | null = null;
let deviceId: string | null = null;

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const getDeviceId = async (): Promise<string> => {
  if (deviceId) return deviceId;

  try {
    // Try to get existing device ID
    deviceId = await SecureStore.getItemAsync('deviceId');

    if (!deviceId) {
      // Generate new device ID if none exists
      deviceId = Application.androidId || Application.iosId || Math.random().toString(36).substring(2, 15);
      await SecureStore.setItemAsync('deviceId', deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    // Fallback to random ID if SecureStore fails
    return Math.random().toString(36).substring(2, 15);
  }
};

export const setEncryptionKey = (key: string) => {
  encryptionKey = key;
};

export const generateQRCode = async (signalingData: string): Promise<string> => {
  const currentDeviceId = await getDeviceId();

  // Include device ID and public key in the QR code data
  const qrData = JSON.stringify({
    signalingData,
    deviceId: currentDeviceId,
    publicKey: encryptionKey,
  });

  return qrData;
};

export const initializePeerConnection = async (isInitiator: boolean): Promise<string> => {
  try {
    peerConnection = new RTCPeerConnection(configuration);

    peerConnection.oniceconnectionstatechange = () => {
      const state = peerConnection?.iceConnectionState;
      console.log('ICE connection state:', state);

      if (state === 'connected' || state === 'completed') {
        useStore.getState().setSyncStatus('connected');
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        useStore.getState().setSyncStatus('offline');
      }
    };

    if (isInitiator) {
      dataChannel = peerConnection.createDataChannel('expenses-sync', {
        ordered: true,
      });
      setupDataChannel(dataChannel);
    } else {
      peerConnection.ondatachannel = (event) => {
        dataChannel = event.channel;
        setupDataChannel(dataChannel);
      };
    }

    if (isInitiator) {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      await new Promise<void>((resolve) => {
        if (peerConnection?.iceGatheringState === 'complete') {
          resolve();
        } else {
          peerConnection!.onicegatheringstatechange = () => {
            if (peerConnection?.iceGatheringState === 'complete') {
              resolve();
            }
          };
        }
      });

      const signalingData: SignalingData = {
        type: 'offer',
        sdp: peerConnection.localDescription!.sdp,
        deviceId: await getDeviceId(),
      };

      return JSON.stringify(signalingData);
    }

    return '';
  } catch (error) {
    console.error('Error initializing peer connection:', error);
    useStore.getState().setSyncStatus('offline');
    throw error;
  }
};

export const handleSignalingData = async (qrDataString: string): Promise<string> => {
  try {
    const qrData = JSON.parse(qrDataString);
    const signalingData: SignalingData = JSON.parse(qrData.signalingData);

    // Store the peer's public key
    if (qrData.publicKey) {
      setEncryptionKey(qrData.publicKey);
    }

    if (signalingData.type === 'offer') {
      if (!peerConnection) {
        await initializePeerConnection(false);
      }

      await peerConnection!.setRemoteDescription(
        new RTCSessionDescription({ type: 'offer', sdp: signalingData.sdp })
      );

      const answer = await peerConnection!.createAnswer();
      await peerConnection!.setLocalDescription(answer);

      await new Promise<void>((resolve) => {
        if (peerConnection?.iceGatheringState === 'complete') {
          resolve();
        } else {
          peerConnection!.onicegatheringstatechange = () => {
            if (peerConnection?.iceGatheringState === 'complete') {
              resolve();
            }
          };
        }
      });

      const responseData: SignalingData = {
        type: 'answer',
        sdp: peerConnection!.localDescription!.sdp,
        deviceId: await getDeviceId(),
      };

      return JSON.stringify(responseData);
    } else if (signalingData.type === 'answer') {
      if (!peerConnection) {
        throw new Error('Peer connection not initialized');
      }

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription({ type: 'answer', sdp: signalingData.sdp })
      );

      // Connection is now established
      return '';
    }

    return '';
  } catch (error) {
    console.error('Error handling signaling data:', error);
    throw error;
  }
};

const setupDataChannel = (channel: RTCDataChannel) => {
  channel.onopen = () => {
    console.log('Data channel opened');
    useStore.getState().setSyncStatus('connected');
    syncExpenses();
  };

  channel.onmessage = async (event) => {
    try {
      if (!encryptionKey) {
        throw new Error('No encryption key available');
      }

      const decrypted = await decryptMessage(event.data, encryptionKey);
      const payload: SyncPayload = JSON.parse(decrypted);

      // Apply the received expenses to local database
      await applySyncPayload(payload);

      // Respond with our own expenses
      await syncExpenses();
    } catch (error) {
      console.error('Error processing received message:', error);
    }
  };

  channel.onclose = () => {
    console.log('Data channel closed');
    useStore.getState().setSyncStatus('offline');
  };
};

export const syncExpenses = async () => {
  if (!dataChannel || dataChannel.readyState !== 'open') {
    console.log('Data channel not ready for sync');
    return;
  }

  try {
    const payload = await createSyncPayload();
    if (!encryptionKey) {
      throw new Error('No encryption key available');
    }

    const encrypted = await encryptMessage(JSON.stringify(payload), encryptionKey);
    dataChannel.send(encrypted);
  } catch (error) {
    console.error('Error during sync:', error);
  }
};

export const createSyncPayload = async (): Promise<SyncPayload> => {
  const expenses = await getExpenses();
  return {
    expenses,
    timestamp: Date.now(),
  };
};

export const applySyncPayload = async (payload: SyncPayload) => {
  const db = useSQLiteContext();

  for (const expense of payload.expenses) {
    // Check if expense already exists
    const existing = await db.getFirstAsync<Expense>(
      'SELECT * FROM expenses WHERE id = ?',
      [expense.id]
    );

    if (existing) {
      // Update if remote expense is newer
      if (expense.updatedAt > existing.updatedAt) {
        await updateExpense(expense);
      }
    } else {
      // Add new expense
      await addExpense(expense);
    }
  }
};

export const closeConnection = () => {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  if (dataChannel) {
    dataChannel.close();
    dataChannel = null;
  }
  useStore.getState().setSyncStatus('offline');
};
