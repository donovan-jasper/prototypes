import * as Location from 'expo-location';
import { getCurrentLocation } from './locationService';

jest.mock('expo-location');

describe('locationService', () => {
  it('returns city and region when location is granted', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 47.6062, longitude: -122.3321 },
    });
    (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([
      { city: 'Seattle', region: 'Washington' },
    ]);

    const location = await getCurrentLocation();
    expect(location).toEqual({ city: 'Seattle', region: 'Washington' });
  });

  it('throws an error when location permission is denied', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    await expect(getCurrentLocation()).rejects.toThrow('Permission to access location was denied');
  });
});
