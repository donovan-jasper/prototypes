import { NativeModules, NativeEventEmitter, Platform, Alert } from 'react-native';

const { CallGuardModule } = NativeModules;

// Create a new event emitter for the native module
const callEventEmitter = new NativeEventEmitter(CallGuardModule);

// Internal state for the current call
let currentCallState = {
  status: 'idle', // 'idle', 'ringing', 'offhook', 'dialing', 'onhold', 'unknown'
  callerId: null,
  uuid: null,
  startTime: null,
  duration: 0,
  transcript: '',
  summary: '',
};

// List of registered listeners
const listeners = new Set();

// Timer for call duration
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
  let newCallerId = callerId === null ? 'Unknown' : callerId; // Handle null callerId from iOS

  // Update callerId if it's an incoming call and we have it
  if (newStatus === 'ringing' && newCallerId) {
    updateCallState({
      status: newStatus,
      callerId: newCallerId,
      uuid: uuid,
      transcript: '',
      summary: '',
    });
  } else if (newStatus === 'offhook') {
    // If a call goes offhook, use the existing callerId if available, otherwise the new one
    updateCallState({
      status: newStatus,
      callerId: currentCallState.callerId || newCallerId,
      uuid: uuid,
    });
    startDurationTimer();
  } else if (newStatus === 'idle') {
    updateCallState({
      status: newStatus,
      uuid: null,
      // Keep callerId for a moment to show "Call ended with X"
    });
    stopDurationTimer();
  } else {
    // For other states like 'dialing', 'onhold', or 'unknown'
    updateCallState({
      status: newStatus,
      callerId: currentCallState.callerId || newCallerId,
      uuid: uuid,
    });
  }
};

const callHandler = {
  /**
   * Initializes the native call monitoring.
   */
  async init() {
    if (!CallGuardModule) {
      console.error('CallGuardModule not found. Ensure native modules are linked and app is built with Expo Dev Client or bare React Native.');
      Alert.alert('Error', 'Native call module not found. Please ensure the app is built correctly (e.g., with Expo Dev Client).');
      return;
    }

    // Add native event listeners
    callEventEmitter.addListener('onIncomingCall', (event) => {
      handleNativeCallEvent({ ...event, state: 'ringing' });
    });
    callEventEmitter.addListener('onCallAnswered', (event) => {
      handleNativeCallEvent({ ...event, state: 'offhook' });
    });
    callEventEmitter.addListener('onCallEnded', (event) => {
      handleNativeCallEvent({ ...event, state: 'idle' });
    });
    callEventEmitter.addListener('onCallStateChanged', handleNativeCallEvent); // Catch all

    try {
      await CallGuardModule.startCallMonitoring();
      console.log('Native call monitoring started.');
    } catch (error) {
      console.error('Failed to start native call monitoring:', error);
      Alert.alert('Call Monitoring Error', `Failed to start: ${error.message}. Please check permissions.`);
    }
  },

  /**
   * Deinitializes the native call monitoring and cleans up listeners.
   */
  async deinit() {
    if (!CallGuardModule) return;

    callEventEmitter.removeAllListeners('onIncomingCall');
    callEventEmitter.removeAllListeners('onCallAnswered');
    callEventEmitter.removeAllListeners('onCallEnded');
    callEventEmitter.removeAllListeners('onCallStateChanged');

    try {
      await CallGuardModule.stopCallMonitoring();
      console.log('Native call monitoring stopped.');
    } catch (error) {
      console.error('Failed to stop native call monitoring:', error);
    }
    stopDurationTimer();
    listeners.clear();
    updateCallState({ status: 'idle', callerId: null, uuid: null, transcript: '', summary: '' });
  },

  /**
   * Adds a listener for call state changes.
   * @param {function} callback - The function to call with the current call state.
   */
  addCallListener(callback) {
    listeners.add(callback);
    // Immediately provide current state to new listener
    callback(currentCallState);
  },

  /**
   * Removes a listener for call state changes.
   * @param {function} callback - The function to remove.
   */
  removeCallListener(callback) {
    listeners.delete(callback);
  },

  /**
   * Attempts to answer the current incoming call.
   * Note: This is highly restricted on both iOS and Android for third-party apps.
   */
  async answerCall() {
    if (!CallGuardModule) return;
    if (currentCallState.status !== 'ringing') {
      Alert.alert('Info', 'No incoming call to answer.');
      return;
    }
    try {
      await CallGuardModule.answerCall();
      Alert.alert('Success', 'Attempted to answer call (may not work for cellular calls).');
    } catch (error) {
      Alert.alert('Action Restricted', `Cannot answer cellular calls programmatically on ${Platform.OS}. ${error.message}`);
      console.error('Failed to answer call:', error);
    }
  },

  /**
   * Attempts to end the current ongoing call.
   * Note: This is highly restricted on both iOS and Android for third-party apps.
   */
  async endCall() {
    if (!CallGuardModule) return;
    if (currentCallState.status !== 'offhook') {
      Alert.alert('Info', 'No active call to end.');
      return;
    }
    try {
      await CallGuardModule.endCall();
      Alert.alert('Success', 'Attempted to end call (may not work for cellular calls).');
    } catch (error) {
      Alert.alert('Action Restricted', `Cannot end cellular calls programmatically on ${Platform.OS}. ${error.message}`);
      console.error('Failed to end call:', error);
    }
  },

  /**
   * Placeholder for screening an incoming call.
   * In a real scenario, this would involve AI processing.
   */
  async screenCall() {
    if (currentCallState.status !== 'ringing') {
      Alert.alert('Info', 'No incoming call to screen.');
      return;
    }
    Alert.alert('Screening Call', `AI is screening the call from ${currentCallState.callerId || 'Unknown'}...`);
    console.log(`AI screening call from ${currentCallState.callerId || 'Unknown'}`);
    // Simulate AI screening process
    updateCallState({ transcript: 'AI: Hello, this is CallGuard. Who is calling?', summary: 'AI initiated screening.' });
    // In a real app, this would involve complex native integration for audio routing
    // and AI processing, which is beyond the scope of basic call detection.
  },

  /**
   * Returns the current call state.
   * @returns {object} The current call state.
   */
  getCurrentCallState() {
    return currentCallState;
  },
};

export default callHandler;
