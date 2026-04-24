import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
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
    // Mock the error case
    (calendarService.fetchCalendarEvents as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    (healthService.fetchHealthData as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('Failed to load data. Please check your connections and try again.')).toBeTruthy();
    });
  });

  it('displays health metrics when data is loaded', async () => {
    // Mock successful data fetch
    const mockCalendarEvents = [
      { title: 'Morning run', startDate: new Date('2023-01-01') },
      { title: 'Evening walk', startDate: new Date('2023-01-02') },
    ];

    const mockHealthData = {
      steps: 5000,
      sleep: 7.5,
      workouts: 3
    };

    (calendarService.fetchCalendarEvents as jest.Mock).mockResolvedValue(mockCalendarEvents);
    (healthService.fetchHealthData as jest.Mock).mockResolvedValue(mockHealthData);
    (calendarService.identifyHabitsFromEvents as jest.Mock).mockReturnValue(['run', 'walk']);

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('5,000')).toBeTruthy();
      expect(getByText('7.5')).toBeTruthy();
      expect(getByText('3')).toBeTruthy();
    });
  });

  it('displays habits when data is loaded', async () => {
    const mockCalendarEvents = [
      { title: 'Morning run', startDate: new Date('2023-01-01') },
      { title: 'Evening walk', startDate: new Date('2023-01-02') },
    ];

    (calendarService.fetchCalendarEvents as jest.Mock).mockResolvedValue(mockCalendarEvents);
    (healthService.fetchHealthData as jest.Mock).mockResolvedValue({});
    (calendarService.identifyHabitsFromEvents as jest.Mock).mockReturnValue(['run', 'walk']);

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('run')).toBeTruthy();
      expect(getByText('walk')).toBeTruthy();
    });
  });

  it('displays empty state when no habits are detected', async () => {
    const mockCalendarEvents = [];

    (calendarService.fetchCalendarEvents as jest.Mock).mockResolvedValue(mockCalendarEvents);
    (healthService.fetchHealthData as jest.Mock).mockResolvedValue({});
    (calendarService.identifyHabitsFromEvents as jest.Mock).mockReturnValue([]);

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('No habits detected yet')).toBeTruthy();
      expect(getByText('Add events to your calendar to track habits')).toBeTruthy();
    });
  });

  it('refreshes data when pull to refresh is triggered', async () => {
    const mockCalendarEvents = [
      { title: 'Morning run', startDate: new Date('2023-01-01') },
    ];

    (calendarService.fetchCalendarEvents as jest.Mock).mockResolvedValue(mockCalendarEvents);
    (healthService.fetchHealthData as jest.Mock).mockResolvedValue({});
    (calendarService.identifyHabitsFromEvents as jest.Mock).mockReturnValue(['run']);

    const { getByText, getByTestId } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('run')).toBeTruthy();
    });

    // Simulate pull to refresh
    const refreshControl = getByTestId('refresh-control');
    fireEvent(refreshControl, 'refresh');

    await waitFor(() => {
      expect(calendarService.fetchCalendarEvents).toHaveBeenCalledTimes(2);
    });
  });
});
