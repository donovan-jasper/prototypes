// src/utils/constants.js
export const DEFAULT_API_URL = 'http://localhost:8080';
export const DEFAULT_WEBSOCKET_URL = 'ws://localhost:8080/ws';

export const PRODUCTION_API_URL = 'https://api.retropulse.app';
export const PRODUCTION_WEBSOCKET_URL = 'wss://api.retropulse.app/ws';

export const isProduction = process.env.NODE_ENV === 'production';
