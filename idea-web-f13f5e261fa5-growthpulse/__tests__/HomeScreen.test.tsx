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

  it('displays error message when data fetch fails', async () => {
    // Mock the failed fetch
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
      { title: 'Morning Run', startDate: new Date('2023-01-01') },
      { title: 'Evening Walk', startDate: new Date('2023-01-02') },
    ];

    const mockHealthData = {
      steps: 5000,
      sleep: 7.5,
      workouts: 3,
    };

    (calendarService.fetchCalendarEvents as jest.Mock).mockResolvedValue(mockCalendarEvents);
    (healthService.fetchHealthData as jest.Mock).mockResolvedValue(mockHealthData);
    (calendarService.identifyHabitsFromEvents as jest.Mock).mockReturnValue(['Run', 'Walk']);

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('5,000')).toBeTruthy();
      expect(getByText('7.5')).toBeTruthy();
      expect(getByText('3')).toBeTruthy();
    });
  });

  it('displays habits when data is loaded', async () => {
    const mockCalendarEvents = [
      { title: 'Morning Run', startDate: new Date('2023-01-01') },
      { title: 'Morning Run', startDate: new Date('2023-01-02') },
      { title: 'Evening Walk', startDate: new Date('2023-01-03') },
    ];

    (calendarService.fetchCalendarEvents as jest.Mock).mockResolvedValue(mockCalendarEvents);
    (healthService.fetchHealthData as jest.Mock).mockResolvedValue({});
    (calendarService.identifyHabitsFromEvents as jest.Mock).mockReturnValue(['Run', 'Walk']);

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('Run')).toBeTruthy();
      expect(getByText('Walk')).toBeTruthy();
    });
  });

  it('refreshes data when pull to refresh is triggered', async () => {
    const mockCalendarEvents = [
      { title: 'Morning Run', startDate: new Date('2023-01-01') },
    ];

    (calendarService.fetchCalendarEvents as jest.Mock).mockResolvedValue(mockCalendarEvents);
    (healthService.fetchHealthData as jest.Mock).mockResolvedValue({});
    (calendarService.identifyHabitsFromEvents as jest.Mock).mockReturnValue(['Run']);

    const { getByText, getByTestId } = render(<HomeScreen />);

    // Wait for initial load
    await waitFor(() => {
      expect(getByText('Run')).toBeTruthy();
    });

    // Mock a new response for refresh
    (calendarService.fetchCalendarEvents as jest.Mock).mockResolvedValueOnce([
      { title: 'Morning Run', startDate: new Date('2023-01-01') },
      { title: 'Evening Walk', startDate: new Date('2023-01-02') },
    ]);

    // Simulate pull to refresh
    fireEvent(getByTestId('refresh-control'), 'onRefresh');

    await waitFor(() => {
      expect(getByText('Walk')).toBeTruthy();
    });
  });
});
