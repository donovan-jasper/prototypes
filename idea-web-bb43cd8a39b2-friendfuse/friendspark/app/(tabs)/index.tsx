import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import FriendCard from '../../components/FriendCard';
import AddFriendModal from '../../components/AddFriendModal';
import { useFriends } from '../../hooks/useFriends';
import { useStreaks } from '../../hooks/useStreaks';
import { initDatabase } from '../../lib/database';

export default function FriendsScreen() {
  const router = useRouter();
  const { friends, refreshFriends, addNewFriend } = useFriends();
  const { streaks, refreshStreaks } = useStreaks();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

  useEffect(() => {
    initDatabase();
  }, []);

  useEffect(() => {
    if (!hasCheckedOnboarding && friends.length === 0) {
      setModalVisible(true);
      setHasCheckedOnboarding(true);
    }
  }, [friends, hasCheckedOnboarding]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshFriends();
    await refreshStreaks();
    setRefreshing(false);
  };

  const handleAddFriend = async (friend) => {
    await addNewFriend(friend);
    setModalVisible(false);
    await refreshStreaks();
  };

  const sortedFriends = [...friends].sort((a, b) => {
    const streakA = streaks[a.id]?.status === 'at-risk' ? 0 : streaks[a.id]?.current || 0;
    const streakB = streaks[b.id]?.status === 'at-risk' ? 0 : streaks[b.id]?.current || 0;
    return streakB - streakA;
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedFriends}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <FriendCard
            friend={item}
            streak={streaks[item.id]}
            onPress={() => router.push(`/friend/${item.id}`)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#DDD" />
            <Text style={styles.emptyText}>No friends yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first friend</Text>
          </View>
        }
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      <AddFriendModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddFriend}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#888',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#AAA',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
