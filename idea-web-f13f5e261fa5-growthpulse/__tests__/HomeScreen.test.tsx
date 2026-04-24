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

  it('renders loading state initially', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Loading your habits and health data...')).toBeTruthy();
  });

  it('displays error state when data fetch fails', async () => {
    // Mock the failed fetch
    (calendarService.getEvents as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    (healthService.getHealthData as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('Failed to load data. Please check your connections and try again.')).toBeTruthy();
    });
  });

  it('displays health metrics when data is loaded', async () => {
    // Mock successful fetch
    (calendarService.getEvents as jest.Mock).mockResolvedValue([]);
    (healthService.getHealthData as jest.Mock).mockResolvedValue({
      steps: 5000,
      sleep: 7.5,
      workouts: 3
    });

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('5,000')).toBeTruthy();
      expect(getByText('7')).toBeTruthy();
      expect(getByText('3')).toBeTruthy();
    });
  });

  it('displays empty state when no habits are detected', async () => {
    // Mock successful fetch with no habits
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
});
