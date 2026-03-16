import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ApplicationBuilder from '../components/ApplicationBuilder';

const ApplicationScreen = ({ route, navigation }) => {
  return (
    <View style={styles.container}>
      <ApplicationBuilder navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ApplicationScreen;
