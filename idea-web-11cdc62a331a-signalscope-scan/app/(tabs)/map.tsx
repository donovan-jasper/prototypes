import React from 'react';
import { View, StyleSheet } from 'react-native';
import CoverageMap from '@/components/CoverageMap';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <CoverageMap />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
