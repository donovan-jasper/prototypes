import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, mediaDevices } from 'react-native-webrtc';
import { encryptMessage, decryptMessage } from './encryption';
import { getExpenses, addExpense, updateExpense, useSQLiteContext } from './database';
import { useStore } from './store';
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

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
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

export const handleSignalingData = async (signalingDataString: string): Promise<string> => {
  try {
    const signalingData: SignalingData = JSON.parse(signalingDataString);

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
      await peerConnection!.setRemoteDescription(
        new RTCSessionDescription({ type: 'answer', sdp: signalingData.sdp })
      );
      return '';
    }

    return '';
  } catch (error) {
    console.error('Error handling signaling data:', error);
    throw error;
  }
};

const setupDataChannel = (channel: RTCDataChannel) => {
  channel.onopen = async () => {
    console.log('Data channel opened');
    useStore.getState().setSyncStatus('connected');
    await performSync();
  };

  channel.onclose = () => {
    console.log('Data channel closed');
    useStore.getState().setSyncStatus('offline');
  };

  channel.onerror = (error) => {
    console.error('Data channel error:', error);
    useStore.getState().setSyncStatus('offline');
  };

  channel.onmessage = async (event) => {
    try {
      if (!encryptionKey) {
        console.error('No encryption key available');
        return;
      }

      const decrypted = await decryptMessage(event.data, encryptionKey);
      const payload: SyncPayload = JSON.parse(decrypted);
      await applySyncPayload(payload);
    } catch (error) {
      console.error('Error handling incoming message:', error);
    }
  };
};

export const createSyncPayload = async (): Promise<SyncPayload> => {
  const db = useSQLiteContext();
  const expenses = await getExpenses(db);
  
  return {
    expenses,
    timestamp: Date.now(),
  };
};

export const applySyncPayload = async (payload: SyncPayload) => {
  try {
    const db = useSQLiteContext();
    const localExpenses = await getExpenses(db);
    const localExpenseMap = new Map(localExpenses.map(e => [e.id, e]));

    for (const remoteExpense of payload.expenses) {
      const localExpense = localExpenseMap.get(remoteExpense.id);

      if (!localExpense) {
        await addExpense(db, {
          description: remoteExpense.description,
          amount: remoteExpense.amount,
          category: remoteExpense.category,
          paidBy: remoteExpense.paidBy,
          splitWith: remoteExpense.splitWith,
          date: remoteExpense.date,
        });
      } else if (remoteExpense.updatedAt > localExpense.updatedAt) {
        await updateExpense(db, remoteExpense.id, {
          description: remoteExpense.description,
          amount: remoteExpense.amount,
          category: remoteExpense.category,
          paidBy: remoteExpense.paidBy,
          splitWith: remoteExpense.splitWith,
          date: remoteExpense.date,
        });
      }
    }

    console.log('Sync payload applied successfully');
  } catch (error) {
    console.error('Error applying sync payload:', error);
    throw error;
  }
};

export const performSync = async () => {
  if (!dataChannel || dataChannel.readyState !== 'open') {
    console.log('Data channel not ready for sync');
    return;
  }

  if (!encryptionKey) {
    console.error('No encryption key set for sync');
    return;
  }

  try {
    useStore.getState().setSyncStatus('syncing');

    const payload = await createSyncPayload();
    const encrypted = await encryptMessage(JSON.stringify(payload), encryptionKey);

    dataChannel.send(encrypted);

    useStore.getState().setSyncStatus('connected');
    console.log('Sync completed successfully');
  } catch (error) {
    console.error('Error performing sync:', error);
    useStore.getState().setSyncStatus('connected');
  }
};

export const setEncryptionKey = (key: string) => {
  encryptionKey = key;
};

export const closePeerConnection = () => {
  if (dataChannel) {
    dataChannel.close();
    dataChannel = null;
  }

  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  useStore.getState().setSyncStatus('offline');
};

const getDeviceId = async (): Promise<string> => {
  return 'device-' + Math.random().toString(36).substring(2, 15);
};

export const generateQRCode = async (): Promise<string> => {
  const signalingData = await initializePeerConnection(true);
  return signalingData;
};
