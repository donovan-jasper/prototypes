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

      const decryptedData = decryptMessage(encryptedData, encryptionKey);
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

export const handleSignalingData = async (qrDataString: string): Promise<string> => {
  try {
    const qrData = JSON.parse(qrDataString);
    const signalingData: SignalingData = JSON.parse(qrData.signalingData);

    if (qrData.publicKey) {
      setEncryptionKey(qrData.publicKey);
    }

    if (!peerConnection) {
      await initializePeerConnection(false);
    }

    if (signalingData.type === 'offer') {
      await peerConnection!.setRemoteDescription(
        new RTCSessionDescription({ type: 'offer', sdp: signalingData.sdp! })
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
      await peerConnection!.setRemoteDescription(
        new RTCSessionDescription({ type: 'answer', sdp: signalingData.sdp! })
      );
    } else if (signalingData.type === 'candidate' && signalingData.candidate) {
      await peerConnection!.addIceCandidate(new RTCIceCandidate(signalingData.candidate));
    }

    return '';
  } catch (error) {
    console.error('Error handling signaling data:', error);
    throw error;
  }
};

export const sendSyncPayload = async () => {
  if (!dataChannel || dataChannel.readyState !== 'open') {
    console.log('Data channel not ready');
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

    if (!encryptionKey) {
      console.error('No encryption key available');
      return;
    }

    const encryptedData = encryptMessage(JSON.stringify(payload), encryptionKey);
    dataChannel.send(encryptedData);
    console.log('Sent sync payload');
  } catch (error) {
    console.error('Error sending sync payload:', error);
  }
};

export const applySyncPayload = async (payload: SyncPayload) => {
  try {
    const db = useSQLiteContext();

    // Only apply changes that are newer than our last sync
    if (payload.timestamp <= lastSyncTimestamp) {
      console.log('Received payload is older than last sync, ignoring');
      return;
    }

    lastSyncTimestamp = payload.timestamp;

    // Process each expense in the payload
    for (const expense of payload.expenses) {
      // Check if we already have this expense
      const existingExpense = await db.getFirstAsync<Expense>(
        'SELECT * FROM expenses WHERE id = ?',
        [expense.id]
      );

      if (existingExpense) {
        // If we have it, update it if the remote version is newer
        if (expense.updatedAt > existingExpense.updatedAt) {
          await updateExpense(expense.id, expense);
        }
      } else {
        // If we don't have it, add it
        await addExpense(expense);
      }
    }

    // Update the UI with the new data
    const allExpenses = await getExpenses();
    useStore.getState().setExpenses(allExpenses);

    console.log('Applied sync payload successfully');
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
