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
    const signalingData: SignalingData = JSON.parse(data);

    if (!peerConnection) {
      await initializePeerConnection(false);
    }

    if (signalingData.type === 'offer') {
      if (!peerConnection) throw new Error('Peer connection not initialized');

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription({
          type: 'offer',
          sdp: signalingData.sdp,
        })
      );

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      const answerData: SignalingData = {
        type: 'answer',
        sdp: answer.sdp,
        deviceId: await getDeviceId(),
      };

      return JSON.stringify(answerData);
    } else if (signalingData.type === 'answer') {
      if (!peerConnection) throw new Error('Peer connection not initialized');

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription({
          type: 'answer',
          sdp: signalingData.sdp,
        })
      );
    } else if (signalingData.type === 'candidate' && signalingData.candidate) {
      if (!peerConnection) throw new Error('Peer connection not initialized');

      await peerConnection.addIceCandidate(
        new RTCIceCandidate(signalingData.candidate)
      );
    }

    return null;
  } catch (error) {
    console.error('Error handling signaling data:', error);
    throw error;
  }
};

export const createSyncPayload = async (): Promise<SyncPayload> => {
  const expenses = await getExpenses();
  const currentDeviceId = await getDeviceId();

  return {
    expenses,
    timestamp: Date.now(),
    deviceId: currentDeviceId,
  };
};

export const applySyncPayload = async (payload: SyncPayload) => {
  const currentDeviceId = await getDeviceId();

  // Only process if payload is newer than our last sync
  if (payload.timestamp <= lastSyncTimestamp) {
    console.log('Payload is older than last sync, skipping');
    return;
  }

  lastSyncTimestamp = payload.timestamp;

  // Process expenses
  for (const expense of payload.expenses) {
    // Skip expenses from our own device
    if (expense.deviceId === currentDeviceId) continue;

    // Check if expense already exists
    const existingExpense = await getExpenseById(expense.id);

    if (existingExpense) {
      // Update existing expense if it's newer
      if (expense.updatedAt > existingExpense.updatedAt) {
        await updateExpense(expense.id, expense);
      }
    } else {
      // Add new expense
      await addExpense(expense);
    }
  }

  // Update the store
  const allExpenses = await getExpenses();
  useStore.getState().setExpenses(allExpenses);
};

export const sendSyncPayload = async () => {
  if (!dataChannel || dataChannel.readyState !== 'open') {
    console.log('Data channel not ready');
    return;
  }

  try {
    const payload = await createSyncPayload();
    if (!encryptionKey) {
      console.error('No encryption key available');
      return;
    }

    const encryptedPayload = await encryptMessage(JSON.stringify(payload), encryptionKey);
    dataChannel.send(encryptedPayload);
  } catch (error) {
    console.error('Error sending sync payload:', error);
  }
};

export const closeConnection = () => {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  dataChannel = null;
  useStore.getState().setSyncStatus('offline');
};
