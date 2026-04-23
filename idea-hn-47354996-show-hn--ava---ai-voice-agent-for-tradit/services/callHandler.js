import { NativeModules, NativeEventEmitter, Platform, Alert } from 'react-native';
import storage from './storage';

const { CallGuardModule } = NativeModules;

const callEventEmitter = new NativeEventEmitter(CallGuardModule);

let currentCallState = {
  status: 'idle',
  callerId: null,
  uuid: null,
  startTime: null,
  duration: 0,
  transcript: '',
  summary: '',
  isScreening: false,
};

const listeners = new Set();
let durationInterval = null;

const updateCallState = (newState) => {
  currentCallState = { ...currentCallState, ...newState };
  listeners.forEach(callback => callback(currentCallState));
};

const startDurationTimer = () => {
  if (durationInterval) {
    clearInterval(durationInterval);
  }
  currentCallState.startTime = Date.now();
  durationInterval = setInterval(() => {
    if (currentCallState.startTime) {
      updateCallState({ duration: Math.floor((Date.now() - currentCallState.startTime) / 1000) });
    }
  }, 1000);
};

const stopDurationTimer = () => {
  if (durationInterval) {
    clearInterval(durationInterval);
    durationInterval = null;
  }
  updateCallState({ duration: 0, startTime: null });
};

const handleNativeCallEvent = (event) => {
  console.log('Native Call Event:', event);
  const { state, callerId, uuid } = event;

  let newStatus = state;
  let newCallerId = callerId === null ? 'Unknown' : callerId;

  if (currentCallState.isScreening && newStatus !== 'idle') {
    console.log('Ignoring native event during AI screening:', event);
    return;
  }

  if (newStatus === 'ringing' && newCallerId) {
    updateCallState({
      status: newStatus,
      callerId: newCallerId,
      uuid: uuid,
      transcript: '',
      summary: '',
      isScreening: false,
    });
  } else if (newStatus === 'offhook') {
    updateCallState({
      status: newStatus,
      callerId: currentCallState.callerId || newCallerId,
      uuid: uuid,
      isScreening: false,
    });
    startDurationTimer();
  } else if (newStatus === 'idle') {
    if (currentCallState.status === 'offhook' || currentCallState.status === 'screening') {
      const callToSave = {
        id: currentCallState.uuid || Date.now().toString(),
        caller_id: currentCallState.callerId,
        call_time: currentCallState.startTime ? new Date(currentCallState.startTime).toISOString() : new Date().toISOString(),
        duration: currentCallState.duration,
        summary: currentCallState.summary || (currentCallState.status === 'offhook' ? 'Call completed.' : 'Screened call completed.'),
        transcript: currentCallState.transcript || (currentCallState.status === 'offhook' ? 'No transcript available for live call.' : 'No transcript generated.'),
        type: currentCallState.status === 'screening' ? 'screened' : 'answered',
      };
      storage.saveCallData(callToSave).catch(e => console.error('Failed to save call data:', e));
    }

    updateCallState({
      status: newStatus,
      uuid: null,
      callerId: null,
      transcript: '',
      summary: '',
      isScreening: false,
    });
    stopDurationTimer();
  } else {
    updateCallState({
      status: newStatus,
      callerId: currentCallState.callerId || newCallerId,
      uuid: uuid,
      isScreening: false,
    });
  }
};

const callHandler = {
  getCurrentCallState() {
    return currentCallState;
  },

  async init() {
    if (!CallGuardModule) {
      console.error('CallGuardModule not found. Ensure native modules are linked and app is built with Expo Dev Client or bare React Native.');
      Alert.alert('Error', 'Native call module not found. Please ensure the app is built correctly (e.g., with Expo Dev Client).');
      return;
    }

    callEventEmitter.addListener('onIncomingCall', (event) => {
      handleNativeCallEvent({ ...event, state: 'ringing' });
    });
    callEventEmitter.addListener('onCallAnswered', (event) => {
      handleNativeCallEvent({ ...event, state: 'offhook' });
    });
    callEventEmitter.addListener('onCallEnded', (event) => {
      handleNativeCallEvent({ ...event, state: 'idle' });
    });
    callEventEmitter.addListener('onCallStateChanged', (event) => {
      handleNativeCallEvent(event);
    });
  },

  deinit() {
    callEventEmitter.removeAllListeners();
    stopDurationTimer();
  },

  addCallListener(callback) {
    listeners.add(callback);
  },

  removeCallListener(callback) {
    listeners.delete(callback);
  },

  answerCall() {
    if (CallGuardModule && CallGuardModule.answerCall) {
      CallGuardModule.answerCall();
    } else {
      console.warn('answerCall not implemented in native module');
    }
  },

  endCall() {
    if (CallGuardModule && CallGuardModule.endCall) {
      CallGuardModule.endCall();
    } else {
      console.warn('endCall not implemented in native module');
    }
  },

  screenCall() {
    updateCallState({
      status: 'screening',
      isScreening: true,
      transcript: '',
      summary: ''
    });
  },

  updateCallData(newData) {
    updateCallState(newData);
  }
};

export default callHandler;
