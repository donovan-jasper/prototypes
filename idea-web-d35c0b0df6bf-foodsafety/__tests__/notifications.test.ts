import { scheduleRecallAlert, requestNotificationPermissions } from '@/services/notifications';
import { addRecallAlert, getRecallAlertsForEstablishment } from '@/services/database';
import * as Notifications from 'expo-notifications';

// Mock the database functions
jest.mock('@/services/database', () => ({
  addRecallAlert: jest.fn(),
  getRecallAlertsForEstablishment: jest.fn(),
}));

// Mock the notifications module
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
}));

describe('Recall Alert Notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should schedule a recall alert notification', async () => {
    const mockNotificationId = '123';
    const mockEstablishmentId = 'est-123';
    const mockEstablishmentName = 'Test Restaurant';
    const mockRecallDate = '2023-12-01T12:00:00Z';
    const mockDescription = 'Contamination risk';

    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(mockNotificationId);
    (addRecallAlert as jest.Mock).mockResolvedValue(true);

    const result = await scheduleRecallAlert(
      mockEstablishmentId,
      mockEstablishmentName,
      mockRecallDate,
      mockDescription
    );

    expect(addRecallAlert).toHaveBeenCalledWith(
      mockEstablishmentId,
      mockRecallDate,
      mockDescription
    );
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
      content: {
        title: 'Food Recall Alert',
        body: `${mockEstablishmentName} has been recalled: ${mockDescription}`,
        data: { establishmentId: mockEstablishmentId, type: 'recall' },
      },
      trigger: new Date(mockRecallDate),
    });
    expect(result).toBe(mockNotificationId);
  });

  it('should request notification permissions', async () => {
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });

    const result = await requestNotificationPermissions();

    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should handle permission denial', async () => {
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const result = await requestNotificationPermissions();

    expect(result).toBe(false);
  });

  it('should retrieve recall alerts for an establishment', async () => {
    const mockAlerts = [
      { id: 1, establishmentId: 'est-123', recallDate: '2023-12-01', description: 'Contamination risk' },
    ];
    (getRecallAlertsForEstablishment as jest.Mock).mockResolvedValue(mockAlerts);

    const result = await getRecallAlertsForEstablishment('est-123');

    expect(getRecallAlertsForEstablishment).toHaveBeenCalledWith('est-123');
    expect(result).toEqual(mockAlerts);
  });
});
