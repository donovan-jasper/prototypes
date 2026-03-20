import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CallScreen from './screens/CallScreen';
import SettingsScreen from './screens/Settings'; // Assuming you'll create this later
import { request, PERMISSIONS } from 'react-native-permissions';
import { Platform, Alert } from 'react-native';

const Stack = createNativeStackNavigator();

function App() {
  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        // READ_PHONE_STATE is crucial for PhoneStateListener
        const phoneStateResult = await request(PERMISSIONS.ANDROID.READ_PHONE_STATE);
        if (phoneStateResult !== 'granted') {
          Alert.alert('Permission Denied', 'Phone state permission is required to detect calls. Please grant it in app settings.');
        }

        // For Android 9+ CallScreeningService, you'd need BIND_SCREENING_SERVICE
        // and potentially REQUEST_DELETE_PACKAGES, which are system permissions
        // and require the app to be the default dialer or have specific system roles.
        // For basic call state detection, READ_PHONE_STATE is primary.
        // RECORD_AUDIO is needed if you were to try and record via speakerphone, but direct call audio is blocked.
      } else if (Platform.OS === 'ios') {
        // CallKit permissions for CXCallObserver are implicitly handled by the system.
        // No explicit permission request is needed from the app for observation.
        // Microphone permission is only needed if you were to record audio or use speech recognition.
        const micResult = await request(PERMISSIONS.IOS.MICROPHONE);
        if (micResult !== 'granted') {
          Alert.alert('Permission Denied', 'Microphone permission is recommended for audio processing (even simulated AI screening).');
        }
      }
    };

    requestPermissions();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CallScreen">
        <Stack.Screen name="CallScreen" component={CallScreen} options={{ title: 'CallGuard' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        {/* Add other screens here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
