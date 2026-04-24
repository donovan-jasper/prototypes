import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import HomeScreen from '../app/(tabs)/home/index';
import { calendarService } from '../lib/api/calendarService';
import { healthService } from '../lib/api/healthService';

// Mock the services
jest.mock('../lib/api/calendarService');
jest.mock('../lib/api/healthService');

describe('HomeScreen', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Loading your habits and health data...')).toBeTruthy();
  });

  it('should display error message when data fetch fails', async () => {
    // Mock the failed API calls
    (calendarService.getEvents as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    (healthService.getHealthData as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('Failed to load data. Please check your connections and try again.')).toBeTruthy();
    });
  });

  it('should display empty state when no habits are detected', async () => {
    // Mock successful API calls with empty data
    (calendarService.getEvents as jest.Mock).mockResolvedValue([]);
    (healthService.getHealthData as jest.Mock).mockResolvedValue({
      steps: 0,
      sleep: 0,
      workouts: 0
    });

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('No habits detected yet.')).toBeTruthy();
    });
  });

  it('should display habits when data is loaded successfully', async () => {
    // Mock successful API calls with sample data
    const mockCalendarEvents = [
      { id: '1', title: 'Morning Run', start: '2023-01-01', end: '2023-01-01' },
      { id: '2', title: 'Morning Run', start: '2023-01-02', end: '2023-01-02' },
      { id: '3', title: 'Evening Walk', start: '2023-01-03', end: '2023-01-03' }
    ];

    const mockHealthData = {
      steps: 5000,
      sleep: 7.5,
      workouts: 3
    };

    (calendarService.getEvents as jest.Mock).mockResolvedValue(mockCalendarEvents);
    (healthService.getHealthData as jest.Mock).mockResolvedValue(mockHealthData);

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('Morning Run')).toBeTruthy();
      expect(getByText('Evening Walk')).toBeTruthy();
      expect(getByText('5,000')).toBeTruthy();
      expect(getByText('7.5')).toBeTruthy();
      expect(getByText('3')).toBeTruthy();
    });
  });
});
