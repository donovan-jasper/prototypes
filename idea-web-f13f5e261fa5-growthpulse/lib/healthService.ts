import { Platform } from 'react-native';
import AppleHealthKit, { HealthValue } from 'react-native-health';
import GoogleFit, { Scopes } from 'react-native-google-fit';

interface HealthData {
  steps: number;
  sleep: number;
  workouts: number;
}

export const initializeHealthKit = async (): Promise<void> => {
  if (Platform.OS === 'ios') {
    const permissions = {
      permissions: {
        read: [
          AppleHealthKit.Constants.Permissions.Steps,
          AppleHealthKit.Constants.Permissions.SleepAnalysis,
          AppleHealthKit.Constants.Permissions.Workout,
        ],
      },
    };

    try {
      await AppleHealthKit.initHealthKit(permissions, (error: string) => {
        console.log('Error initializing HealthKit:', error);
      });
    } catch (error) {
      console.error('Error initializing HealthKit:', error);
      throw error;
    }
  }
};

export const initializeGoogleFit = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    const options = {
      scopes: [
        Scopes.FITNESS_ACTIVITY_READ,
        Scopes.FITNESS_BODY_READ,
        Scopes.FITNESS_SLEEP_READ,
      ],
    };

    try {
      const isAuthorized = await GoogleFit.checkIsAuthorized();
      if (!isAuthorized) {
        await GoogleFit.authorize(options);
      }
    } catch (error) {
      console.error('Error initializing Google Fit:', error);
      throw error;
    }
  }
};

export const fetchHealthData = async (): Promise<HealthData> => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 7); // Last 7 days

  if (Platform.OS === 'ios') {
    try {
      const steps: HealthValue[] = await AppleHealthKit.getDailyStepCountSamples({
        startDate: startDate.toISOString(),
        endDate: today.toISOString(),
      });

      const sleep: HealthValue[] = await AppleHealthKit.getSleepSamples({
        startDate: startDate.toISOString(),
        endDate: today.toISOString(),
      });

      const workouts: HealthValue[] = await AppleHealthKit.getWorkouts({
        startDate: startDate.toISOString(),
        endDate: today.toISOString(),
      });

      return {
        steps: steps.reduce((sum, item) => sum + (item.value || 0), 0),
        sleep: sleep.reduce((sum, item) => sum + (item.value || 0), 0),
        workouts: workouts.length,
      };
    } catch (error) {
      console.error('Error fetching HealthKit data:', error);
      throw error;
    }
  } else if (Platform.OS === 'android') {
    try {
      const steps = await GoogleFit.getDailySteps(startDate, today);
      const sleep = await GoogleFit.getSleepData(startDate, today);
      const workouts = await GoogleFit.getWorkouts(startDate, today);

      return {
        steps: steps.reduce((sum, item) => sum + (item.steps || 0), 0),
        sleep: sleep.reduce((sum, item) => sum + (item.duration || 0), 0),
        workouts: workouts.length,
      };
    } catch (error) {
      console.error('Error fetching Google Fit data:', error);
      throw error;
    }
  }

  return { steps: 0, sleep: 0, workouts: 0 };
};
