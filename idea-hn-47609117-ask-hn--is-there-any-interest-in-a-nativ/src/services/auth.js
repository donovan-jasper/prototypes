import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = 'YOUR_DISCORD_CLIENT_ID';
const REDIRECT_URI = AuthSession.makeRedirectUri({
  useProxy: Platform.OS !== 'web',
});
const RESPONSE_TYPE = 'token';
const SCOPE = 'identify guilds messages.read';
const DISCORD_AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

const authenticateWithDiscord = async () => {
  try {
    const result = await AuthSession.startAsync({
      authUrl: DISCORD_AUTH_URL,
    });

    if (result.type === 'success') {
      const accessToken = result.params.access_token;
      return accessToken;
    } else {
      throw new Error('Authentication failed');
    }
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

export { authenticateWithDiscord };
