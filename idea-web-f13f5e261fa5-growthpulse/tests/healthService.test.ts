import { fetchHealthData, initializeHealthKit, initializeGoogleFit } from '../lib/healthService';
import { Platform } from 'react-native';
import AppleHealthKit from 'react-native-health';
import GoogleFit from 'react-native-google-fit';

jest.mock('react-native-health');
jest.mock('react-native-google-fit');

describe('Health Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeHealthKit', () => {
    it('should initialize HealthKit on iOS', async () => {
      Platform.OS = 'ios';
      const mockInitHealthKit = jest.fn().mockResolvedValue(true);
      AppleHealthKit.initHealthKit = mockInitHealthKit;

      await initializeHealthKit();

      expect(mockInitHealthKit).toHaveBeenCalled();
    });

    it('should not initialize HealthKit on Android', async () => {
      Platform.OS = 'android';
      const mockInitHealthKit = jest.fn();
      AppleHealthKit.initHealthKit = mockInitHealthKit;

      await initializeHealthKit();

      expect(mockInitHealthKit).not.toHaveBeenCalled();
    });
  });

  describe('initializeGoogleFit', () => {
    it('should initialize Google Fit on Android', async () => {
      Platform.OS = 'android';
      const mockCheckIsAuthorized = jest.fn().mockResolvedValue(false);
      const mockAuthorize = jest.fn().mockResolvedValue(true);
      GoogleFit.checkIsAuthorized = mockCheckIsAuthorized;
      GoogleFit.authorize = mockAuthorize;

      await initializeGoogleFit();

      expect(mockCheckIsAuthorized).toHaveBeenCalled();
      expect(mockAuthorize).toHaveBeenCalled();
    });

    it('should not initialize Google Fit on iOS', async () => {
      Platform.OS = 'ios';
      const mockCheckIsAuthorized = jest.fn();
      GoogleFit.checkIsAuthorized = mockCheckIsAuthorized;

      await initializeGoogleFit();

      expect(mockCheckIsAuthorized).not.toHaveBeenCalled();
    });
  });

  describe('fetchHealthData', () => {
    it('should fetch health data from HealthKit on iOS', async () => {
      Platform.OS = 'ios';
      const mockGetDailyStepCountSamples = jest.fn().mockResolvedValue([{ value: 1000 }]);
      const mockGetSleepSamples = jest.fn().mockResolvedValue([{ value: 8 }]);
      const mockGetWorkouts = jest.fn().mockResolvedValue([{}, {}]);

      AppleHealthKit.getDailyStepCountSamples = mockGetDailyStepCountSamples;
      AppleHealthKit.getSleepSamples = mockGetSleepSamples;
      AppleHealthKit.getWorkouts = mockGetWorkouts;

      const result = await fetchHealthData();

      expect(result).toEqual({
        steps: 1000,
        sleep: 8,
        workouts: 2,
      });
    });

    it('should fetch health data from Google Fit on Android', async () => {
      Platform.OS = 'android';
      const mockGetDailySteps = jest.fn().mockResolvedValue([{ steps: 1000 }]);
      const mockGetSleepData = jest.fn().mockResolvedValue([{ duration: 8 }]);
      const mockGetWorkouts = jest.fn().mockResolvedValue([{}, {}]);

      GoogleFit.getDailySteps = mockGetDailySteps;
      GoogleFit.getSleepData = mockGetSleepData;
      GoogleFit.getWorkouts = mockGetWorkouts;

      const result = await fetchHealthData();

      expect(result).toEqual({
        steps: 1000,
        sleep: 8,
        workouts: 2,
      });
    });
  });
});
