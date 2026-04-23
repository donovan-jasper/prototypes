import { kubernetesAPI } from '../src/services/KubernetesAPI';
import axios from 'axios';
import WebSocket from 'ws';

jest.mock('axios');
jest.mock('ws');

describe('KubernetesAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchMetrics', () => {
    it('should return default metrics when API call fails', async () => {
      axios.get.mockRejectedValue(new Error('API Error'));

      const result = await kubernetesAPI.fetchMetrics();

      expect(result).toEqual({
        cpu: 50,
        memory: 60,
        disk: 70
      });
    });

    it('should calculate metrics from API response', async () => {
      const mockResponse = {
        data: {
          items: [{
            usage: {
              cpu: '2000000000', // 2 cores
              memory: '4294967296', // 4GB
              capacity: {
                cpu: '8000000000', // 8 cores
                memory: '32212254720' // 32GB
              }
            }
          }]
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const result = await kubernetesAPI.fetchMetrics();

      expect(result.cpu).toBe(25); // 2/8 * 100
      expect(result.memory).toBe(12); // 4/32 * 100
    });
  });

  describe('subscribeToMetrics', () => {
    it('should establish WebSocket connection and handle messages', () => {
      const mockWebSocket = {
        on: jest.fn(),
        onmessage: jest.fn(),
        onopen: jest.fn(),
        onerror: jest.fn(),
        onclose: jest.fn(),
        close: jest.fn()
      };

      WebSocket.mockImplementation(() => mockWebSocket);

      const callback = jest.fn();
      const unsubscribe = kubernetesAPI.subscribeToMetrics('ws://test', callback);

      // Simulate WebSocket open event
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen();
      }

      expect(callback).toHaveBeenCalledWith({
        cpu: 50,
        memory: 60,
        disk: 70
      });

      // Simulate WebSocket message
      const testMetrics = { cpu: 30, memory: 40, disk: 50 };
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({ data: JSON.stringify(testMetrics) });
      }

      expect(callback).toHaveBeenCalledWith(testMetrics);

      // Test unsubscribe
      unsubscribe();
      expect(mockWebSocket.close).toHaveBeenCalled();
    });
  });
});
