// path/to/callguard/services/storage.js
// Minimal mock storage.js to satisfy CallScreen.js requirements
// In a real app, this would use SQLite or AsyncStorage.

let MOCK_CALL_DATA = [ // Changed to `let` so it can be modified
  {
    id: '1',
    caller_id: '123-456-7890',
    call_time: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour ago
    duration: 120, // Added duration for consistency
    summary: 'Discussed project updates and next steps.',
    transcript: 'Hello, this is John. How are you? I am good. We need to talk about the project. Okay, let\'s discuss the next steps. Sounds good.',
    type: 'answered', // Added type for consistency
  },
  {
    id: '2',
    caller_id: '987-654-3210',
    call_time: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
    duration: 60, // Added duration for consistency
    summary: 'Confirmed meeting schedule for next week.',
    transcript: 'Hi Sarah, just confirming our meeting for next Tuesday. Yes, confirmed. See you then.',
    type: 'answered', // Added type for consistency
  },
];

const storage = {
  async getCallData() {
    console.log('Fetching mock past call data...');
    return new Promise(resolve => {
      setTimeout(() => {
        // Return a deep copy to prevent external modification of the internal array
        resolve(JSON.parse(JSON.stringify(MOCK_CALL_DATA)));
      }, 500); // Simulate network delay
    });
  },

  async saveCallData(call) {
    console.log('Saving mock call data:', call);
    return new Promise(resolve => {
      setTimeout(() => {
        const newCall = {
          ...call,
          id: call.id || String(MOCK_CALL_DATA.length + 1), // Ensure unique ID if not provided
          call_time: call.call_time || new Date().toISOString(), // Ensure timestamp if not provided
        };
        MOCK_CALL_DATA.unshift(newCall); // Add to the beginning for most recent first
        resolve(true);
      }, 100);
    });
  },
};

export default storage;
