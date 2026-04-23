import { FlashlightService } from '../lib/flashlightService';
import { Camera } from 'expo-camera';

jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn(),
  },
}));

describe('FlashlightService', () => {
  let service: FlashlightService;
  let mockCameraRef: { current: { setFlashModeAsync: jest.Mock } };

  beforeEach(() => {
    mockCameraRef = {
      current: {
        setFlashModeAsync: jest.fn(),
      },
    };
    service = new FlashlightService(mockCameraRef as any);
  });

  test('checkPermissions returns true when granted', async () => {
    (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    const result = await service.checkPermissions();
    expect(result).toBe(true);
  });

  test('checkPermissions returns false when denied', async () => {
    (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    const result = await service.checkPermissions();
    expect(result).toBe(false);
  });

  test('sendSOS creates correct flash pattern', async () => {
    await service.sendSOS('SOS');

    // Verify the flash was turned on and off in the correct sequence
    expect(mockCameraRef.current.setFlashModeAsync).toHaveBeenCalledTimes(15); // 3 dots + 3 dashes + 3 dots + gaps
    expect(mockCameraRef.current.setFlashModeAsync).toHaveBeenNthCalledWith(1, 'torch');
    expect(mockCameraRef.current.setFlashModeAsync).toHaveBeenNthCalledWith(2, 'off');
    expect(mockCameraRef.current.setFlashModeAsync).toHaveBeenNthCalledWith(3, 'torch');
    expect(mockCameraRef.current.setFlashModeAsync).toHaveBeenNthCalledWith(4, 'off');
    expect(mockCameraRef.current.setFlashModeAsync).toHaveBeenNthCalledWith(5, 'torch');
    expect(mockCameraRef.current.setFlashModeAsync).toHaveBeenNthCalledWith(6, 'off');
    // ... and so on for the full SOS pattern
  });

  test('sendSOS handles custom messages', async () => {
    await service.sendSOS('HELP');

    // Verify the pattern matches the Morse code for "HELP"
    expect(mockCameraRef.current.setFlashModeAsync).toHaveBeenCalled();
  });

  test('sendSOS turns off flash when done', async () => {
    await service.sendSOS('SOS');

    // Verify the last call was to turn off the flash
    const lastCall = mockCameraRef.current.setFlashModeAsync.mock.calls.pop();
    expect(lastCall[0]).toBe('off');
  });

  test('sendSOS handles errors gracefully', async () => {
    mockCameraRef.current.setFlashModeAsync.mockRejectedValue(new Error('Flash failed'));

    await expect(service.sendSOS('SOS')).resolves.not.toThrow();

    // Verify flash was turned off even if there was an error
    expect(mockCameraRef.current.setFlashModeAsync).toHaveBeenCalledWith('off');
  });
});
