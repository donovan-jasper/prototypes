import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SafetyBadge = ({ verified }) => {
  return (
    <View style={[styles.badge, verified ? styles.verified : styles.unverified]}>
      <Text style={styles.text}>{verified ? 'Verified' : 'Unverified'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 10,
    padding: 5,
    alignSelf: 'flex-start',
  },
  verified: {
    backgroundColor: 'green',
  },
  unverified: {
    backgroundColor: 'gray',
  },
  text: {
    color: 'white',
    fontSize: 12,
  },
});

export default SafetyBadge;
