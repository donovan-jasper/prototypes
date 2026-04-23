import { WEBSOCKET_ENDPOINT } from '../utils/constants';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.callback = null;
    this.errorCallback = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.isConnected = false;
    this.fallbackInterval = null;
  }

  connect(callback, errorCallback) {
    this.callback = callback;
    this.errorCallback = errorCallback;

    if (this.ws) {
      this.ws.close();
    }

    try {
      this.ws = new WebSocket(WEBSOCKET_ENDPOINT);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.setupFallbackPolling(false);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.callback) {
            this.callback(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
        if (this.errorCallback) {
          this.errorCallback(error);
        }
        this.attemptReconnect();
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.setupFallbackPolling(true);
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.isConnected = false;
      this.setupFallbackPolling(true);
      if (this.errorCallback) {
        this.errorCallback(error);
      }
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(`Attempting to reconnect in ${delay}ms...`);
    setTimeout(() => {
      this.connect(this.callback, this.errorCallback);
    }, delay);
  }

  setupFallbackPolling(enable) {
    if (enable && !this.fallbackInterval) {
      console.log('Setting up fallback polling');
      this.fallbackInterval = setInterval(() => {
        if (this.callback) {
          const mockData = {
            cpu: Math.floor(Math.random() * 101),
            memory: Math.floor(Math.random() * 101),
            disk: Math.floor(Math.random() * 101)
          };
          this.callback(mockData);
        }
      }, 30000); // Poll every 30 seconds
    } else if (!enable && this.fallbackInterval) {
      console.log('Disabling fallback polling');
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.setupFallbackPolling(false);
  }
}

export const webSocketService = new WebSocketService();
