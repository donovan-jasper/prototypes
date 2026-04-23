import React from 'react';
import { View, StyleSheet } from 'react-native';
import MentorChat from '../../components/MentorChat';
import { useIssuesStore } from '../../store/issuesStore';
import { useAuthStore } from '../../store/authStore';

export default function MentorScreen() {
  const { claimedIssues } = useIssuesStore();
  const { isSubscribed } = useAuthStore();

  return (
    <View style={styles.container}>
      <MentorChat
        claimedIssues={claimedIssues}
        isSubscribed={isSubscribed}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
