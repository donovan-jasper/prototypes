import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function GroupMemberList({ members }) {
  return (
    <View style={styles.container}>
      {members.map((member, index) => (
        <Text key={index} variant="bodyLarge" style={styles.member}>
          {member.name}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  member: {
    marginBottom: 4,
  },
});
