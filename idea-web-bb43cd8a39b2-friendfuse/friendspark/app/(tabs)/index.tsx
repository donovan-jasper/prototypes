import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import FriendCard from '../../components/FriendCard';
import { useFriends } from '../../hooks/useFriends';
import { useStreaks } from '../../hooks/useStreaks';

export default function FriendsScreen() {
  const router = useRouter();
  const { friends, refreshFriends } = useFriends();
  const { streaks, refreshStreaks } = useStreaks();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshFriends();
    await refreshStreaks();
    setRefreshing(false);
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
});
