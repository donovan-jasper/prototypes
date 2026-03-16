import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useMediaStore } from '../../store/mediaStore';

const ProfileScreen = () => {
  const { media } = useMediaStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.stats}>Total media tracked: {media.length}</Text>
      <Button title="Upgrade to Premium" onPress={() => {}} />
      <Button title="Export Data" onPress={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  stats: {
    fontSize: 18,
    marginBottom: 16,
  },
});

export default ProfileScreen;
