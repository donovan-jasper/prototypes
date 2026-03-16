import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthRequest } from 'expo-auth-session';
import { useCloudStore } from '../../store/cloudStore';
import { DROPBOX_CLIENT_ID } from '../../utils/constants';

const DropboxAuthScreen = () => {
  const { connectCloud } = useCloudStore();

  const [request, response, promptAsync] = useAuthRequest({
    clientId: DROPBOX_CLIENT_ID,
    scopes: ['files.metadata.read', 'files.content.read'],
    redirectUri: 'mediamesh://auth/dropbox',
  }, {
    authorizationEndpoint: 'https://www.dropbox.com/oauth2/authorize',
    tokenEndpoint: 'https://api.dropboxapi.com/oauth2/token',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      connectCloud('dropbox', access_token);
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Connecting to Dropbox...</Text>
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

export default DropboxAuthScreen;
