import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../app/(tabs)/home/index';
import * as healthService from '../lib/healthService';
import * as calendarService from '../lib/calendarService';

// Mock the services
jest.mock('../lib/healthService');
jest.mock('../lib/calendarService');

describe('HomeScreen', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Loading your data...')).toBeTruthy();
  });

  it('displays error state when initialization fails', async () => {
    (healthService.initializeHealthKit as jest.Mock).mockRejectedValue(new Error('Initialization failed'));

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('Failed to initialize services. Please check permissions.')).toBeTruthy();
    });
  });

  it('displays health data and habits after successful sync', async () => {
    const mockHealthData = { steps: 5000, sleep: 7, workouts: 3 };
    const mockEvents = [{ title: 'Morning run', start: new Date() }];
    const mockHabits = ['Exercise'];

    (healthService.initializeHealthKit as jest.Mock).mockResolvedValue(undefined);
    (healthService.initializeGoogleFit as jest.Mock).mockResolvedValue(undefined);
    (healthService.fetchHealthData as jest.Mock).mockResolvedValue(mockHealthData);
    (calendarService.fetchCalendarEvents as jest.Mock).mockResolvedValue(mockEvents);
    (calendarService.identifyHabitsFromEvents as jest.Mock).mockReturnValue(mockHabits);

    const { getByText, getByTestId } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('5000')).toBeTruthy();
      expect(getByText('7')).toBeTruthy();
      expect(getByText('3')).toBeTruthy();
      expect(getByText('Exercise')).toBeTruthy();
    });
  });

  it('shows syncing state when sync button is pressed', async () => {
    const mockHealthData = { steps: 5000, sleep: 7, workouts: 3 };
    const mockEvents = [{ title: 'Morning run', start: new Date() }];
    const mockHabits = ['Exercise'];

    (healthService.initializeHealthKit as jest.Mock).mockResolvedValue(undefined);
    (healthService.initializeGoogleFit as jest.Mock).mockResolvedValue(undefined);
    (healthService.fetchHealthData as jest.Mock).mockResolvedValue(mockHealthData);
    (calendarService.fetchCalendarEvents as jest.Mock).mockResolvedValue(mockEvents);
    (calendarService.identifyHabitsFromEvents as jest.Mock).mockReturnValue(mockHabits);

    const { getByText, getByTestId } = render(<HomeScreen />);

    // Wait for initial load to complete
    await waitFor(() => {
      expect(getByText('5000')).toBeTruthy();
    });

    // Click sync button
    const syncButton = getByText('Sync Now');
    fireEvent.press(syncButton);

    // Verify syncing state is shown
    await waitFor(() => {
      expect(healthService.fetchHealthData).toHaveBeenCalled();
      expect(calendarService.fetchCalendarEvents).toHaveBeenCalled();
    });
  });
});
