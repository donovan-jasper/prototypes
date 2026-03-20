import { NativeModules, NativeEventEmitter, Platform, Alert } from 'react-native';
import storage from './storage'; // Import storage to save screened calls

const { CallGuardModule } = NativeModules;

// Create a new event emitter for the native module
const callEventEmitter = new NativeEventEmitter(CallGuardModule);

// Internal state for the current call
let currentCallState = {
  status: 'idle', // 'idle', 'ringing', 'offhook', 'dialing', 'onhold', 'unknown', 'screening'
  callerId: null,
  uuid: null,
  startTime: null,
  duration: 0,
  transcript: '',
  summary: '',
  isScreening: false, // New flag for AI screening process
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

  // If we are currently screening, do not let native events override the screening status
  // unless the native event indicates the call has truly ended (idle).
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
      isScreening: false, // Ensure screening is off for a new incoming call
    });
  } else if (newStatus === 'offhook') {
    // If a call goes offhook, use the existing callerId if available, otherwise the new one
    updateCallState({
      status: newStatus,
      callerId: currentCallState.callerId || newCallerId,
      uuid: uuid,
      isScreening: false,
    });
    startDurationTimer();
  } else if (newStatus === 'idle') {
    // If a call ends, save it if it was offhook or screened
    if (currentCallState.status === 'offhook' || currentCallState.status === 'screening') {
      // Save the call data before resetting
      const callToSave = {
        id: currentCallState.uuid || Date.now().toString(), // Use UUID or timestamp as ID
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
      callerId: null, // Reset callerId after call ends
      transcript: '',
      summary: '',
      isScreening: false,
    });
    stopDurationTimer();
  } else {
    // For other states like 'dialing', 'onhold', or 'unknown'
    updateCallState({
      status: newStatus,
      callerId: currentCallState.callerId || newCallerId,
      uuid: uuid,
      isScreening: false,
    });
  }
};

const callHandler = {
  /**
   * Returns the current state of the call.
   * @returns {object} The current call state.
   */
  getCurrentCallState() {
    return currentCallState;
  },

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
    updateCallState({ status: 'idle', callerId: null, uuid: null, transcript: '', summary: '', isScreening: false });
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
   * Simulates answering an incoming call.
   * In a real app, this would interact with native call APIs.
   */
  async answerCall() {
    if (currentCallState.status === 'ringing') {
      console.log('Simulating answering call...');
      // In a real app, you'd call a native module method here
      // await CallGuardModule.answerCall(currentCallState.uuid);
      updateCallState({ status: 'offhook', isScreening: false });
      startDurationTimer();
    } else {
      console.warn('Cannot answer call: Not in ringing state.');
    }
  },

  /**
   * Simulates ending an active call.
   * In a real app, this would interact with native call APIs.
   */
  async endCall() {
    if (currentCallState.status === 'offhook' || currentCallState.status === 'dialing' || currentCallState.status === 'onhold') {
      console.log('Simulating ending call...');
      // In a real app, you'd call a native module method here
      // await CallGuardModule.endCall(currentCallState.uuid);
      // The handleNativeCallEvent for 'idle' will take care of saving and resetting
      handleNativeCallEvent({ state: 'idle', uuid: currentCallState.uuid, callerId: currentCallState.callerId });
    } else {
      console.warn('Cannot end call: No active call to end.');
    }
  },

  /**
   * Simulates AI screening an incoming call.
   * Progressively updates transcript and then provides a summary.
   */
  async screenCall() {
    if (currentCallState.status !== 'ringing' || currentCallState.isScreening) {
      console.warn('Cannot screen call: Not in ringing state or already screening.');
      Alert.alert('Screening Error', 'Cannot screen call unless it is ringing and not already being screened.');
      return;
    }

    const callerId = currentCallState.callerId || 'Unknown Caller';
    console.log(`Simulating AI screening for call from ${callerId}...`);

    updateCallState({
      status: 'screening',
      transcript: 'AI Assistant is connecting...',
      summary: 'Generating summary...',
      isScreening: true,
    });

    const transcriptSnippets = [
      "Hello, this is CallGuard's AI assistant. Who is calling, please?",
      "I'm screening this call for the recipient. Could you state the purpose of your call?",
      "Okay, I understand. So, you're calling about the appointment on Tuesday?",
      "The recipient is currently unavailable. I can take a message or forward your request.",
      "Thank you for that information. I will relay it to the recipient.",
      "Is there anything else I can assist you with regarding this matter?",
      "Alright, I have all the necessary details. The call is now concluded.",
    ];

    let currentTranscript = '';
    for (let i = 0; i < transcriptSnippets.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second per snippet
      currentTranscript += (i > 0 ? '\n' : '') + transcriptSnippets[i];
      updateCallState({ transcript: currentTranscript });
    }

    await new Promise(resolve => setTimeout(resolve, 2000)); // Give a moment before summary

    const finalSummary = `Incoming call from ${callerId}. Caller confirmed the meeting details and left a message about a slight delay. AI assistant successfully screened the call and gathered information.`;

    updateCallState({
      summary: finalSummary,
      transcript: currentTranscript, // Ensure final transcript is set
      isScreening: false, // Screening process is complete
    });

    // After screening, the call is effectively handled by AI and ends.
    // Trigger the idle state to save the call and reset.
    handleNativeCallEvent({ state: 'idle', uuid: currentCallState.uuid, callerId: currentCallState.callerId });
  },
};

export default callHandler;
