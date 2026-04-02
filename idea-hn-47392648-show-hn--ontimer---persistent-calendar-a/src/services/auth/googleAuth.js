import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { saveConnectedCalendar, getConnectedCalendars, updateCalendarTokens } from '../data/settingsRepository';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = Platform.select({
  ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  android: process.env
