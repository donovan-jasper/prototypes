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
        const results = await request(PERMISSIONS.ANDROID.READ_PHONE_STATE);
        // For Android 9+ CallScreeningService, you'd need REQUEST_DELETE_PACKAGES and BIND_SCREENING_SERVICE
        // For basic call state, READ_PHONE_STATE is primary.
        // RECORD_AUDIO is needed if you were to try and record via speakerphone, but direct call audio is blocked.
        if (results !== 'granted') {
          Alert.alert('Permission Denied', 'Phone state permission is required to detect calls.');
        }
      } else if (Platform.OS === 'ios') {
        // CallKit permissions are typically requested when the CXProvider is configured,
        // but we can prompt for microphone usage if we were to simulate recording.
        const micResult = await request(PERMISSIONS.IOS.MICROPHONE);
        if (micResult !== 'granted') {
          Alert.alert('Permission Denied', 'Microphone permission is required for audio processing (even simulated).');
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
