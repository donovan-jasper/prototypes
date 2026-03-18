import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Friend } from '@/lib/types';
import { getAllFriends, initDatabase } from '@/lib/database';
import FriendCard from '@/components/FriendCard';

export default function FriendsScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFriends = useCallback(async () => {
    try {
      const allFriends = await getAllFriends();
      setFriends(allFriends);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    initDatabase().then(() => {
      loadFriends();
    });
  }, [loadFriends]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadFriends();
  };

  const handleAddFriend = () => {
    router.push('/add-friend');
  };

  const handleFriendPress = (friendId: string) => {
    router.push(`/friend/${friendId}`);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  if (friends.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No friends yet</Text>
          <Text style={styles.emptyText}>
            Start building your circle by adding your first friend
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddFriend}>
            <Text style={styles.addButtonText}>Add Friend</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FriendCard friend={item} onPress={() => handleFriendPress(item.id)} />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
      
      <TouchableOpacity style={styles.fab} onPress={handleAddFriend}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
  },
});
