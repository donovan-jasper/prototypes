import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthRequest } from 'expo-auth-session';
import { useCloudStore } from '../../store/cloudStore';
import { GOOGLE_CLIENT_ID } from '../../utils/constants';

const GoogleAuthScreen = () => {
  const { connectCloud } = useCloudStore();

  const [request, response, promptAsync] = useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    redirectUri: 'mediamesh://auth/google',
  }, {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      connectCloud('google', access_token);
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Connecting to Google Drive...</Text>
      <Button title="Connect" onPress={() => promptAsync()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default GoogleAuthScreen;
