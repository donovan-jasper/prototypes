import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';
import { encryptMessage, decryptMessage } from './encryption';
import { getExpenses, addExpense, updateExpense } from './database';
import { useStore } from './store';
import * as SecureStore from 'expo-secure-store';
import * as Application from 'expo-application';
import type { Expense } from './types';

interface SyncPayload {
  expenses: Expense[];
  timestamp: number;
  deviceId: string;
}

interface SignalingData {
  type: 'offer' | 'answer' | 'candidate';
  sdp?: string;
  candidate?: RTCIceCandidateInit;
  deviceId: string;
}

let peerConnection: RTCPeerConnection | null = null;
let dataChannel: RTCDataChannel | null = null;
let encryptionKey: string | null = null;
let deviceId: string | null = null;
let lastSyncTimestamp: number = 0;

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const getDeviceId = async (): Promise<string> => {
  if (deviceId) return deviceId;

  try {
    deviceId = await SecureStore.getItemAsync('deviceId');

    if (!deviceId) {
      deviceId = Application.androidId || Application.iosId || Math.random().toString(36).substring(2, 15);
      await SecureStore.setItemAsync('deviceId', deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    return Math.random().toString(36).substring(2, 15);
  }
};

export const setEncryptionKey = (key: string) => {
  encryptionKey = key;
};

export const generateQRCode = async (signalingData: string): Promise<string> => {
  const currentDeviceId = await getDeviceId();

  const qrData = JSON.stringify({
    signalingData,
    deviceId: currentDeviceId,
    publicKey: encryptionKey,
  });

  return qrData;
};

const setupDataChannel = (channel: RTCDataChannel) => {
  channel.onopen = () => {
    console.log('Data channel opened');
    useStore.getState().setSyncStatus('connected');
    // Trigger initial sync
    sendSyncPayload();
  };

  channel.onmessage = async (event) => {
    try {
      const encryptedData = event.data;
      if (!encryptionKey) {
        console.error('No encryption key available');
        return;
      }

      const decryptedData = await decryptMessage(encryptedData, encryptionKey);
      const payload: SyncPayload = JSON.parse(decryptedData);

      console.log('Received sync payload:', payload);

      // Apply the received changes
      await applySyncPayload(payload);

      // Send our changes back
      await sendSyncPayload();
    } catch (error) {
      console.error('Error processing received data:', error);
    }
  };

  channel.onclose = () => {
    console.log('Data channel closed');
    useStore.getState().setSyncStatus('offline');
  };
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

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const signalingData: SignalingData = {
          type: 'candidate',
          candidate: event.candidate.toJSON(),
          deviceId: deviceId || '',
        };
        // In a real app, you would send this to the peer via signaling server
        console.log('ICE candidate:', signalingData);
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

export const handleSignalingData = async (data: string): Promise<string | null> => {
  try {
    const parsedData: { signalingData: string; deviceId: string; publicKey: string } = JSON.parse(data);

    if (!peerConnection) {
      await initializePeerConnection(false);
    }

    const signalingData: SignalingData = JSON.parse(parsedData.signalingData);

    if (signalingData.type === 'offer') {
      if (!peerConnection?.localDescription) {
        await peerConnection?.setRemoteDescription(new RTCSessionDescription({
          type: 'offer',
          sdp: signalingData.sdp,
        }));

        const answer = await peerConnection?.createAnswer();
        await peerConnection?.setLocalDescription(answer);

        const responseData: SignalingData = {
          type: 'answer',
          sdp: answer?.sdp,
          deviceId: await getDeviceId(),
        };

        return JSON.stringify(responseData);
      }
    } else if (signalingData.type === 'answer') {
      if (peerConnection?.localDescription?.type === 'offer') {
        await peerConnection?.setRemoteDescription(new RTCSessionDescription({
          type: 'answer',
          sdp: signalingData.sdp,
        }));
      }
    } else if (signalingData.type === 'candidate' && signalingData.candidate) {
      await peerConnection?.addIceCandidate(new RTCIceCandidate(signalingData.candidate));
    }

    return null;
  } catch (error) {
    console.error('Error handling signaling data:', error);
    throw error;
  }
};

export const sendSyncPayload = async () => {
  if (!dataChannel || dataChannel.readyState !== 'open' || !encryptionKey) {
    console.log('Data channel not ready or no encryption key');
    return;
  }

  try {
    const expenses = await getExpenses();
    const currentDeviceId = await getDeviceId();

    const payload: SyncPayload = {
      expenses,
      timestamp: Date.now(),
      deviceId: currentDeviceId,
    };

    const encryptedPayload = await encryptMessage(JSON.stringify(payload), encryptionKey);
    dataChannel.send(encryptedPayload);
    console.log('Sync payload sent');
  } catch (error) {
    console.error('Error sending sync payload:', error);
  }
};

export const applySyncPayload = async (payload: SyncPayload) => {
  try {
    const currentDeviceId = await getDeviceId();

    // Only process payloads from other devices
    if (payload.deviceId === currentDeviceId) {
      return;
    }

    // Only process newer payloads
    if (payload.timestamp <= lastSyncTimestamp) {
      return;
    }

    lastSyncTimestamp = payload.timestamp;

    // Process expenses
    for (const expense of payload.expenses) {
      const existingExpense = await getExpenseById(expense.id);

      if (!existingExpense) {
        await addExpense(expense);
      } else if (existingExpense.updatedAt < expense.updatedAt) {
        await updateExpense(expense);
      }
    }

    console.log('Sync payload applied successfully');
  } catch (error) {
    console.error('Error applying sync payload:', error);
  }
};

export const closeConnection = () => {
  if (dataChannel) {
    dataChannel.close();
  }

  if (peerConnection) {
    peerConnection.close();
  }

  peerConnection = null;
  dataChannel = null;
  useStore.getState().setSyncStatus('offline');
};

// Helper function to get expense by ID
const getExpenseById = async (id: string): Promise<Expense | null> => {
  const expenses = await getExpenses();
  return expenses.find(expense => expense.id === id) || null;
};
