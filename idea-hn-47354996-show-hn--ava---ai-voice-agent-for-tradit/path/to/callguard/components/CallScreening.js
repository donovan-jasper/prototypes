import { NativeModules, NativeEventEmitter, Platform, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import storage from '../services/storage'; // Assuming storage.js is correctly implemented

const { CallGuardModule } = NativeModules;
const CallGuardEventEmitter = new NativeEventEmitter(CallGuardModule);

const db = SQLite.openDatabase('callguard.db');

// --- IMPORTANT CAVEAT ---
// Direct access to cellular call audio streams for third-party apps is NOT possible
// on iOS or Android due to strict privacy and security policies.
// This implementation will simulate the audio stream and STT process for demonstration.
// For real audio processing, the app would need to be a VoIP client itself,
// or rely on speakerphone recording (which is unreliable and low quality and requires user action).
// The native modules primarily handle call state detection and basic management (answer/end where possible).
// -------------------------

const CallScreening = {
  _isInitialized: false,
  _callListeners: [],
  _sttInterval: null,
  _currentCallData: null,

  init: async () => {
    if (CallScreening._isInitialized) {
      return;
    }

    // Initialize the database
    db.transaction((tx) => {
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS calls (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          caller_id TEXT,
          call_time TEXT,
          transcript TEXT,
          summary TEXT,
          status TEXT
        );
      `, [], () => console.log('Calls table created or exists.'),
         (tx, error) => console.error('Error creating calls table:', error));
    });

    // Start native call monitoring
    try {
      await CallGuardModule.startCallMonitoring();
      console.log('Native call monitoring started.');
    } catch (e) {
      console.error('Failed to start native call monitoring:', e);
      Alert.alert('Error', `Failed to start call monitoring: ${e.message}. Please ensure permissions are granted.`);
    }

    // Set up native event listeners
    CallGuardEventEmitter.addListener('onIncomingCall', CallScreening._handleIncomingCall);
    CallGuardEventEmitter.addListener('onCallAnswered', CallScreening._handleCallAnswered);
    CallGuardEventEmitter.addListener('onCallEnded', CallScreening._handleCallEnded);
    CallGuardEventEmitter.addListener('onCallStateChanged', CallScreening._handleCallStateChanged); // Generic for debugging

    CallScreening._isInitialized = true;
  },

  deinit: async () => {
    if (!CallScreening._isInitialized) {
      return;
    }

    // Stop native call monitoring
    try {
      await CallGuardModule.stopCallMonitoring();
      console.log('Native call monitoring stopped.');
    } catch (e) {
      console.error('Failed to stop native call monitoring:', e);
    }

    // Remove listeners
    CallGuardEventEmitter.removeAllListeners('onIncomingCall');
    CallGuardEventEmitter.removeAllListeners('onCallAnswered');
    CallGuardEventEmitter.removeAllListeners('onCallEnded');
    CallGuardEventEmitter.removeAllListeners('onCallStateChanged');

    CallScreening._isInitialized = false;
  },

  // Register a callback to receive call updates
  addCallListener: (callback) => {
    CallScreening._callListeners.push(callback);
    // Immediately send current call data if available
    if (CallScreening._currentCallData) {
      callback(CallScreening._currentCallData);
    }
  },

  removeCallListener: (callback) => {
    CallScreening._callListeners = CallScreening._callListeners.filter(listener => listener !== callback);
  },

  _notifyListeners: (data) => {
    CallScreening._currentCallData = { ...CallScreening._currentCallData, ...data };
    CallScreening._callListeners.forEach(listener => listener(CallScreening._currentCallData));
  },

  _handleIncomingCall: (event) => {
    console.log('Incoming Call Event:', event);
    const callerId = event.incomingNumber || 'Unknown Caller';
    const callTime = new Date().toISOString();
    CallScreening._currentCallData = {
      callerId,
      callTime,
      transcript: 'Ringing...',
      summary: 'Incoming call from ' + callerId,
      status: 'ringing',
      uuid: event.uuid || null, // iOS specific
    };
    CallScreening._notifyListeners({});
  },

  _handleCallAnswered: (event) => {
    console.log('Call Answered Event:', event);
    if (!CallScreening._currentCallData) {
      // This might happen if the app wasn't running when the call started,
      // or if it was an outgoing call.
      CallScreening._currentCallData = {
        callerId: event.callerId || 'Unknown',
        callTime: new Date().toISOString(),
        transcript: '',
        summary: 'Call in progress.',
        status: 'offhook',
        uuid: event.uuid || null,
      };
    }
    CallScreening._currentCallData.status = 'offhook';
    CallScreening._currentCallData.transcript = 'Call connected. Starting transcription...';
    CallScreening._notifyListeners({});
    CallScreening._startSimulatedSTT();
  },

  _handleCallEnded: async (event) => {
    console.log('Call Ended Event:', event);
    CallScreening._stopSimulatedSTT();

    if (CallScreening._currentCallData) {
      CallScreening._currentCallData.status = 'idle';
      CallScreening._currentCallData.transcript = CallScreening._currentCallData.transcript || 'Call ended.';
      CallScreening._currentCallData.summary = CallScreening._currentCallData.summary || 'Call ended.';
      CallScreening._notifyListeners({});

      // Save the final call data to the database
      await storage.saveCallData(CallScreening._currentCallData);
      console.log('Call data saved:', CallScreening._currentCallData);
    }
    CallScreening._currentCallData = null; // Reset for next call
  },

  _handleCallStateChanged: (event) => {
    console.log('Call State Changed:', event);
    // This event can be used for more granular UI updates if needed
  },

  // --- Simulated Speech-to-Text (STT) and Summarization ---
  _startSimulatedSTT: () => {
    if (CallScreening._sttInterval) {
      clearInterval(CallScreening._sttInterval);
    }

    let transcriptChunks = [
      "Hello, thank you for calling. How can I help you today?",
      "I'm calling about the job application I submitted last week.",
      "Ah yes, for the Senior Software Engineer position, correct?",
      "That's right. I wanted to follow up on the status of my application.",
      "I see. Your application is currently under review by the hiring manager.",
      "Do you have an estimated timeline for when I might hear back?",
      "We expect to finalize the initial screening within the next few days.",
      "Great, thank you for the update. I appreciate it.",
      "You're welcome. Is there anything else I can assist you with?",
      "No, that's all for now. Have a good day!",
      "You too. Goodbye."
    ];
    let currentChunkIndex = 0;
    let fullTranscript = "";

    CallScreening._sttInterval = setInterval(() => {
      if (currentChunkIndex < transcriptChunks.length) {
        const newChunk = transcriptChunks[currentChunkIndex] + " ";
        fullTranscript += newChunk;
        CallScreening._currentCallData.transcript = fullTranscript;
        CallScreening._currentCallData.summary = CallScreening._generateSimulatedSummary(fullTranscript);
        CallScreening._notifyListeners({});
        currentChunkIndex++;
      } else {
        // End of simulated conversation
        CallScreening._stopSimulatedSTT();
        CallScreening._currentCallData.transcript += "\n(Simulated conversation ended)";
        CallScreening._notifyListeners({});
      }
    }, 3000); // Simulate a new chunk every 3 seconds
  },

  _stopSimulatedSTT: () => {
    if (CallScreening._sttInterval) {
      clearInterval(CallScreening._sttInterval);
      CallScreening._sttInterval = null;
    }
  },

  _generateSimulatedSummary: (transcript) => {
    // Simple summarization logic based on keywords or length
    if (transcript.length < 50) {
      return "Call in progress...";
    }
    const keywords = ["job application", "follow up", "status", "hiring manager", "timeline", "update"];
    const foundKeywords = keywords.filter(kw => transcript.toLowerCase().includes(kw));
    if (foundKeywords.length > 0) {
      return `Discussion about a job application. Key points: ${foundKeywords.join(', ')}.`;
    }
    return "Ongoing conversation. Details emerging...";
  },

  // Public methods for UI to interact with native module
  answerCall: async () => {
    if (CallScreening._currentCallData && CallScreening._currentCallData.status === 'ringing') {
      try {
        const success = await CallGuardModule.answerCall();
        if (success) {
          console.log('Attempted to answer call via native module.');
          // The _handleCallAnswered event should fire from native side
        } else {
          Alert.alert('Failed', 'Could not answer call programmatically.');
        }
      } catch (e) {
        console.error('Error answering call:', e);
        Alert.alert('Error', `Failed to answer call: ${e.message}.`);
      }
    } else {
      Alert.alert('Info', 'No incoming call to answer.');
    }
  },

  endCall: async () => {
    if (CallScreening._currentCallData && CallScreening._currentCallData.status === 'offhook') {
      try {
        // As noted in native code, ending cellular calls is highly restricted.
        // This will likely fail for cellular calls.
        const success = await CallGuardModule.endCall();
        if (success) {
          console.log('Attempted to end call via native module.');
          // The _handleCallEnded event should fire from native side
        } else {
          Alert.alert('Failed', 'Could not end call programmatically.');
        }
      } catch (e) {
        console.error('Error ending call:', e);
        Alert.alert('Error', `Failed to end call: ${e.message}. This feature is highly restricted for cellular calls.`);
      }
    } else {
      Alert.alert('Info', 'No active call to end.');
    }
  },
};

export default CallScreening;
