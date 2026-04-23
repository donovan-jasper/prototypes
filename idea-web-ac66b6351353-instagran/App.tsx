import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { UserProvider } from './src/context/UserContext';
import ProfileScreen from './src/screens/ProfileScreen';
import MatchScreen from './src/screens/MatchScreen';
import EventScreen from './src/screens/EventScreen';
import VideoCallScreen from './src/screens/VideoCallScreen';

export type RootStackParamList = {
  ProfileScreen: undefined;
  MatchScreen: undefined;
  EventScreen: { user: { id: string; name: string; hobbies: string[] } };
  VideoCall: { userId: string; matchedUserId: string; eventId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="ProfileScreen">
          <Stack.Screen
            name="ProfileScreen"
            component={ProfileScreen}
            options={{ title: 'Your Profile' }}
          />
          <Stack.Screen
            name="MatchScreen"
            component={MatchScreen}
            options={{ title: 'Find Matches' }}
          />
          <Stack.Screen
            name="EventScreen"
            component={EventScreen}
            options={{ title: 'Schedule Event' }}
          />
          <Stack.Screen
            name="VideoCall"
            component={VideoCallScreen}
            options={{
              title: 'Video Call',
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}
