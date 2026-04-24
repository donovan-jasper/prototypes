import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import HomeScreen from '../../app/(tabs)/home/index';
import { calendarService } from '../../lib/api/calendarService';
import { healthService } from '../../lib/api/healthService';

// Mock the services
jest.mock('../../lib/api/calendarService');
jest.mock('../../lib/api/healthService');

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
    (calendarService.fetchCalendarEvents as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    (healthService.fetchHealthData as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('Failed to load data. Please check your connections and try again.')).toBeTruthy();
    });
  });

  it('should display empty state when no habits are detected', async () => {
    // Mock successful API calls with empty data
    (calendarService.fetchCalendarEvents as jest.Mock).mockResolvedValue([]);
    (healthService.fetchHealthData as jest.Mock).mockResolvedValue({
      steps: 0,
      sleep: 0,
      workouts: 0
    });

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('No habits detected yet.')).toBeTruthy();
      expect(getByText('Add events to your calendar to track them automatically.')).toBeTruthy();
    });
  });

  it('should display habits when data is loaded successfully', async () => {
    // Mock successful API calls with sample data
    const mockCalendarEvents = [
      {
        id: '1',
        title: 'Morning Run',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-01')
      },
      {
        id: '2',
        title: 'Morning Run',
        startDate: new Date('2023-01-02'),
        endDate: new Date('2023-01-02')
      },
      {
        id: '3',
        title: 'Evening Walk',
        startDate: new Date('2023-01-03'),
        endDate: new Date('2023-01-03')
      }
    ];

    const mockHealthData = {
      steps: 5000,
      sleep: 7.5,
      workouts: 3
    };

    (calendarService.fetchCalendarEvents as jest.Mock).mockResolvedValue(mockCalendarEvents);
    (healthService.fetchHealthData as jest.Mock).mockResolvedValue(mockHealthData);
    (calendarService.identifyHabitsFromEvents as jest.Mock).mockReturnValue(['Morning Run', 'Evening Walk']);

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('Morning Run')).toBeTruthy();
      expect(getByText('Evening Walk')).toBeTruthy();
      expect(getByText('5,000')).toBeTruthy();
      expect(getByText('7.5')).toBeTruthy();
      expect(getByText('3')).toBeTruthy();
    });
  });

  it('should handle timezone differences in streak calculation', async () => {
    // Mock data with dates that span midnight in different timezones
    const mockCalendarEvents = [
      {
        id: '1',
        title: 'Morning Run',
        startDate: new Date('2023-01-01T23:00:00Z'), // 11 PM UTC
        endDate: new Date('2023-01-01T23:00:00Z')
      },
      {
        id: '2',
        title: 'Morning Run',
        startDate: new Date('2023-01-02T23:00:00Z'), // 11 PM UTC
        endDate: new Date('2023-01-02T23:00:00Z')
      }
    ];

    const mockHealthData = {
      steps: 5000,
      sleep: 7.5,
      workouts: 3
    };

    (calendarService.fetchCalendarEvents as jest.Mock).mockResolvedValue(mockCalendarEvents);
    (healthService.fetchHealthData as jest.Mock).mockResolvedValue(mockHealthData);
    (calendarService.identifyHabitsFromEvents as jest.Mock).mockReturnValue(['Morning Run']);

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      // Should show streak of 2 for a user in UTC+1 (where dates are same day)
      expect(getByText('2')).toBeTruthy();
    });
  });

  it('should handle non-consecutive days in streak calculation', async () => {
    // Mock data with non-consecutive days
    const mockCalendarEvents = [
      {
        id: '1',
        title: 'Morning Run',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-01')
      },
      {
        id: '2',
        title: 'Morning Run',
        startDate: new Date('2023-01-03'), // Skip day 2
        endDate: new Date('2023-01-03')
      }
    ];

    const mockHealthData = {
      steps: 5000,
      sleep: 7.5,
      workouts: 3
    };

    (calendarService.fetchCalendarEvents as jest.Mock).mockResolvedValue(mockCalendarEvents);
    (healthService.fetchHealthData as jest.Mock).mockResolvedValue(mockHealthData);
    (calendarService.identifyHabitsFromEvents as jest.Mock).mockReturnValue(['Morning Run']);

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      // Should show streak of 1 (only consecutive days count)
      expect(getByText('1')).toBeTruthy();
    });
  });
});
