// path/to/callguard/services/storage.js
// Minimal mock storage.js to satisfy CallScreen.js requirements
// In a real app, this would use SQLite or AsyncStorage.

const MOCK_CALL_DATA = [
  {
    id: '1',
    caller_id: '123-456-7890',
    call_time: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour ago
    summary: 'Discussed project updates and next steps.',
    transcript: 'Hello, this is John. How are you? I am good. We need to talk about the project. Okay, let\'s discuss the next steps. Sounds good.',
  },
  {
    id: '2',
    caller_id: '987-654-3210',
    call_time: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
    summary: 'Confirmed meeting schedule for next week.',
    transcript: 'Hi Sarah, just confirming our meeting for next Tuesday. Yes, confirmed. See you then.',
  },
];

const storage = {
  async getCallData() {
    console.log('Fetching mock past call data...');
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(MOCK_CALL_DATA);
      }, 500); // Simulate network delay
    });
  },

  async saveCallData(call) {
    console.log('Saving mock call data:', call);
    // In a real app, you'd save to SQLite or AsyncStorage
    return new Promise(resolve => {
      setTimeout(() => {
        MOCK_CALL_DATA.push({ ...call, id: String(MOCK_CALL_DATA.length + 1) });
        resolve(true);
      }, 100);
    });
  },
};

export default storage;
