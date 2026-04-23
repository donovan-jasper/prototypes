export const WEBSOCKET_ENDPOINT = process.env.NODE_ENV === 'production'
  ? 'wss://your-production-websocket-endpoint'
  : 'ws://localhost:8080';

export const API_ENDPOINT = process.env.NODE_ENV === 'production'
  ? 'https://your-production-api-endpoint'
  : 'https://your-development-api-endpoint';

export const DEFAULT_WEBSOCKET_URL = 'wss://default-websocket-endpoint.example.com';
export const DEFAULT_API_URL = 'https://default-api-endpoint.example.com';
