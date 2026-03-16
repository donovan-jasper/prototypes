export const Config = {
  // Backend API endpoints
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.tunelocal.app',
  
  // Tuner discovery timeout in milliseconds
  TUNER_DISCOVERY_TIMEOUT: 5000,
  
  // Stream buffer time in seconds
  STREAM_BUFFER_TIME: 10,
  
  // Feature flags
  ENABLE_REMOTE_STREAMING: true,
  ENABLE_CLOUD_DVR: false,
  
  // Default channel list for demo purposes
  DEFAULT_CHANNELS: [
    { id: '1', name: 'ABC', number: '7.1', currentShow: 'Good Morning America' },
    { id: '2', name: 'CBS', number: '2.1', currentShow: 'The Talk' },
    { id: '3', name: 'NBC', number: '5.1', currentShow: 'Today Show' },
    { id: '4', name: 'FOX', number: '11.1', currentShow: 'Local News' },
    { id: '5', name: 'PBS', number: '9.1', currentShow: 'Sesame Street' },
    { id: '6', name: 'CW', number: '13.1', currentShow: 'Local Sports' },
    { id: '7', name: 'Univision', number: '34.1', currentShow: 'Noticiero Univision' },
    { id: '8', name: 'Telemundo', number: '42.1', currentShow: 'Noticias Telemundo' },
  ],
};
