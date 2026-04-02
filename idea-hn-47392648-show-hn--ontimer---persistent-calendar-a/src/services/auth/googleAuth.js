import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { saveConnectedCalendar, getConnectedCalendars, updateCalendarTokens } from '../data/settingsRepository';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = Platform.select({
  ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
});

const GOOGLE_REDIRECT_URI = Platform.select({
  ios: 'org.reactjs.native.example.Vigil:/',
  android: 'host.exp.exponent:/',
});

const SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';

const authConfig = {
  clientId: GOOGLE_CLIENT_ID,
  redirectUri: GOOGLE_REDIRECT_URI,
  scopes: [SCOPE],
};

const handleGoogleAuth = async () => {
  const { type, accessToken } = await AuthSession.startAsync({
    authUrl: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${authConfig.clientId}&redirect_uri=${authConfig.redirectUri}&response_type=token&scope=${authConfig.scopes.join(' ')}`,
  });

  if (type === 'success') {
    await updateCalendarTokens(accessToken);
    return accessToken;
  }

  throw new Error('Google authentication failed');
};

export { handleGoogleAuth };
