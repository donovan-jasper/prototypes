import { HealthData } from '../../types';

export const healthService = {
  async getHealthData(): Promise<HealthData[]> {
    // In a real app, this would connect to Apple HealthKit or Google Fit
    // For demo purposes, we return mock data
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            type: 'steps',
            value: 8500,
            date: new Date('2023-05-01')
          },
          {
            id: '2',
            type: 'sleep',
            value: 7.5, // hours
            date: new Date('2023-05-01')
          },
          {
            id: '3',
            type: 'water',
            value: 8, // glasses
            date: new Date('2023-05-01')
          },
          {
            id: '4',
            type: 'steps',
            value: 9200,
            date: new Date('2023-05-02')
          },
          {
            id: '5',
            type: 'sleep',
            value: 8.1,
            date: new Date('2023-05-02')
          },
          {
            id: '6',
            type: 'water',
            value: 9,
            date: new Date('2023-05-02')
          },
          {
            id: '7',
            type: 'steps',
            value: 7800,
            date: new Date('2023-05-03')
          },
          {
            id: '8',
            type: 'sleep',
            value: 6.9,
            date: new Date('2023-05-03')
          },
          {
            id: '9',
            type: 'water',
            value: 7,
            date: new Date('2023-05-03')
          }
        ]);
      }, 1000);
    });
  }
};
