import * as LocalAuthentication from 'expo-local-authentication';

const authenticate = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) {
    throw new Error('No biometric hardware available');
  }

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) {
    throw new Error('No biometrics enrolled');
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Authenticate to access EchoVault',
    fallbackLabel: 'Use Passcode',
  });

  if (!result.success) {
    throw new Error('Authentication failed');
  }

  return true;
};

export default authenticate;
