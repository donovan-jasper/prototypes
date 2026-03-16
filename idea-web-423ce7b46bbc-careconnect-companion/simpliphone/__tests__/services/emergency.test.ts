import { Linking } from 'react-native';
import * as SMS from 'expo-sms';
import { triggerEmergencyCall, sendEmergencySMS } from '../../services/emergency';

jest.mock('react-native', () => ({
  Linking: {
    openURL: jest.fn(),
  },
}));

jest.mock('expo-sms', () => ({
  isAvailableAsync: jest.fn(),
  sendSMSAsync: jest.fn(),
}));

describe('emergency service', () => {
  it('triggers an emergency call correctly', async () => {
    await triggerEmergencyCall('1234567890');

    expect(Linking.openURL).toHaveBeenCalledWith('tel:1234567890');
  });

  it('sends an emergency SMS correctly', async () => {
    SMS.isAvailableAsync.mockResolvedValue(true);
    SMS.sendSMSAsync.mockResolvedValue(true);

    await sendEmergencySMS('1234567890', 'Emergency!');

    expect(SMS.isAvailableAsync).toHaveBeenCalled();
    expect(SMS.sendSMSAsync).toHaveBeenCalledWith(['1234567890'], 'Emergency!');
  });
});
