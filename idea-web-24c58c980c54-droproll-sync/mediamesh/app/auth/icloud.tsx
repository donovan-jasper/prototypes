import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCloudStore } from '../../store/cloudStore';

const iCloudAuthScreen = () => {
  const { connectCloud } = useCloudStore();

  useEffect(() => {
    // iCloud auth logic here
    const token = 'icloud-token';
    connectCloud('icloud', token);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Connecting to iCloud...</Text>
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

export default iCloudAuthScreen;
