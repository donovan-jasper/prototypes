import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react-native';
import MonitoringScreen from '../../src/components/MonitoringScreen';
import { kubernetesAPI } from '../../src/services/KubernetesAPI'; // Import the actual instance to mock it

// Mock the KubernetesAPI service module.
// This ensures that when MonitoringScreen imports kubernetesAPI, it gets our mock.
jest.mock('../../src/services/KubernetesAPI', () => ({
  kubernetesAPI: {
    // Provide a default mock implementation for subscribeToMetrics.
    // This will be overridden in beforeEach for more specific test setups.
    subscribeToMetrics: jest.fn((callback) => {
      callback({ cpu: 0, memory: 0, disk: 0 }); // Initial dummy data
      return jest.fn(); // Return a mock unsubscribe function
    }),
  },
}));

describe('MonitoringScreen', () => {
  // Clear all mocks and reset mock implementations before each test to ensure test isolation.
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock implementation for subscribeToMetrics for each test.
    // This ensures that each test starts with a clean slate and can define its own mock behavior.
    kubernetesAPI.subscribeToMetrics.mockImplementation((callback) => {
      callback({ cpu: 10, memory: 20, disk: 30 }); // Default initial mock data for tests
      return jest.fn(); // Return a mock unsubscribe function
    });
  });

  it('renders initial system metrics from the API', async () => {
    render(<MonitoringScreen />);

    // Verify that subscribeToMetrics was called once on mount
    expect(kubernetesAPI.subscribeToMetrics).toHaveBeenCalledTimes(1);

    // Check if the initial mock data is displayed correctly
    expect(screen.getByText('System Metrics:')).toBeTruthy();
    expect(screen.getByText('CPU:')).toBeTruthy();
    // Using toFixed(1) in component, so expect '10.0%'
    expect(screen.getByText('10.0%')).toBeTruthy();
    expect(screen.getByText('Memory:')).toBeTruthy();
    expect(screen.getByText('20.0%')).toBeTruthy();
    expect(screen.getByText('Disk:')).toBeTruthy();
    expect(screen.getByText('30.0%')).toBeTruthy();
  });

  it('updates system metrics when new data is received', async () => {
    let capturedCallback; // To hold the callback passed to subscribeToMetrics
    const mockUnsubscribe = jest.fn();

    // Re-mock subscribeToMetrics to capture the callback and allow simulating updates
    kubernetesAPI.subscribeToMetrics.mockImplementation((callback) => {
      capturedCallback = callback; // Store the callback for later use
      callback({ cpu: 10, memory: 20, disk: 30 }); // Initial data
      return mockUnsubscribe;
    });

    render(<MonitoringScreen />);

    // Verify initial state
    expect(screen.getByText('10.0%')).toBeTruthy();
    expect(screen.getByText('20.0%')).toBeTruthy();
    expect(screen.getByText('30.0%')).toBeTruthy();

    // Simulate a new metric update by calling the captured callback
    // `act` is used to ensure all updates related to the state change are processed.
    act(() => {
      capturedCallback({ cpu: 45.5, memory: 55.1, disk: 65.9 });
    });

    // Wait for the screen to update with the new metrics.
    // `waitFor` is essential for asynchronous updates in React components.
    await waitFor(() => {
      expect(screen.getByText('45.5%')).toBeTruthy();
      expect(screen.getByText('55.1%')).toBeTruthy();
      expect(screen.getByText('65.9%')).toBeTruthy();
    });
  });

  it('unsubscribes from metrics when the component unmounts', () => {
    const mockUnsubscribe = jest.fn();
    // Ensure subscribeToMetrics returns our mock unsubscribe function
    kubernetesAPI.subscribeToMetrics.mockReturnValue(mockUnsubscribe);

    const { unmount } = render(<MonitoringScreen />);

    // Unmount the component
    unmount();

    // Check if the unsubscribe function returned by subscribeToMetrics was called
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
