import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

const CallControls = ({ connectionId }) => {
  return (
    <View style={styles.container}>
      <Button title="Mute" onPress={() => {}} />
      <Button title="Video" onPress={() => {}} />
      <Button title="Switch Camera" onPress={() => {}} />
      <Button title="End Call" onPress={() => {}} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#fff',
  },
});

export default CallControls;
