import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useFriend } from '../../hooks/useFriend';
import StreakBadge from '../../components/StreakBadge';
import ConnectionTimeline from '../../components/ConnectionTimeline';

export default function FriendDetailScreen() {
  const { id } = useLocalSearchParams();
  const { friend, streak, interactions, logInteraction } = useFriend(id);

  if (!friend) {
    return (
      <View style={styles.container}>
        <Text>Friend not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{friend.name}</Text>
        <StreakBadge streak={streak} />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => logInteraction('text')}
        >
          <Text style={styles.actionText}>Log Text</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => logInteraction('call')}
        >
          <Text style={styles.actionText}>Log Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => logInteraction('hangout')}
        >
          <Text style={styles.actionText}>Log Hangout</Text>
        </TouchableOpacity>
      </View>

      <ConnectionTimeline interactions={interactions} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#FF6B6B',
    padding: 10,
    borderRadius: 5,
  },
  actionText: {
    color: '#FFF',
    fontSize: 16,
  },
});
