import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { saveConnectedCalendar, getConnectedCalendars, updateCalendarTokens } from '../data/settingsRepository';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = Platform.select({
  ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  default: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

const GOOGLE_REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'vigil',
  path: 'redirect',
});

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
];

/**
 * Initiates Google OAuth flow and returns access token and refresh token
 * @returns {Promise<{accessToken: string, refreshToken: string, expiresIn: number, calendarId: string}>}
 */
export const authenticateWithGoogle = async () => {
  try {
    const [request, response, promptAsync] = AuthSession.useAuthRequest(
      {
        clientId: GOOGLE_CLIENT_ID,
        scopes: SCOPES,
        redirectUri: GOOGLE_REDIRECT_URI,
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
        extraParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
      discovery
    );

    const result = await promptAsync();

    if (result.type !== 'success') {
      throw new Error('Authentication failed or was cancelled');
    }

    const tokenResponse = await AuthSession.exchangeCodeAsync(
      {
        clientId: GOOGLE_CLIENT_ID,
        code: result.params.code,
        redirectUri: GOOGLE_REDIRECT_URI,
        extraParams: {
          code_verifier: request.codeVerifier,
        },
      },
      discovery
    );

    const { accessToken, refreshToken, expiresIn } = tokenResponse;

    // Get user's primary calendar ID
    const userInfoResponse = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList/primary', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const calendarData = await userInfoResponse.json();
    const calendarId = calendarData.id;

    // Save to settings repository
    await saveConnectedCalendar({
      id: calendarId,
      provider: 'google',
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
      lastSyncTime: null,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn,
      calendarId,
    };
  } catch (error) {
    console.error('Google authentication error:', error);
    throw error;
  }
};

/**
 * Refreshes an expired access token using the refresh token
 * @param {string} refreshToken - The refresh token
 * @returns {Promise<{accessToken: string, expiresIn: number}>}
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await fetch(discovery.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || 'Failed to refresh token');
    }

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

/**
 * Gets a valid access token for a calendar, refreshing if necessary
 * @param {string} calendarId - The calendar ID
 * @returns {Promise<string>} Valid access token
 */
export const getValidAccessToken = async (calendarId) => {
  try {
    const calendars = await getConnectedCalendars();
    const calendar = calendars.find(cal => cal.id === calendarId);

    if (!calendar) {
      throw new Error('Calendar not found');
    }

    // Check if token is expired or about to expire (within 5 minutes)
    const isExpired = calendar.expiresAt < Date.now() + 5 * 60 * 1000;

    if (isExpired && calendar.refreshToken) {
      const { accessToken, expiresIn } = await refreshAccessToken(calendar.refreshToken);
      
      // Update stored tokens
      await updateCalendarTokens(calendarId, {
        accessToken,
        expiresAt: Date.now() + expiresIn * 1000,
      });

      return accessToken;
    }

    return calendar.accessToken;
  } catch (error) {
    console.error('Error getting valid access token:', error);
    throw error;
  }
};

/**
 * Revokes Google Calendar access
 * @param {string} accessToken - The access token to revoke
 */
export const revokeGoogleAccess = async (accessToken) => {
  try {
    await fetch(`${discovery.revocationEndpoint}?token=${accessToken}`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error revoking access:', error);
    throw error;
  }
};
