import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getSocialFeed } from '../../lib/database';
import SocialFeedItem from '../../components/SocialFeedItem';
import Colors from '../../constants/Colors';

const SocialScreen = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchFeed = async () => {
    try {
      const items = await getSocialFeed();
      setFeedItems(items);
    } catch (error) {
      console.error('Error fetching social feed:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchFeed();
    setIsRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFeed();
    }, [])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={feedItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <SocialFeedItem item={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.tint}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No activity yet. Start building habits to see updates here!</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  listContent: {
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
  },
});

export default SocialScreen;
