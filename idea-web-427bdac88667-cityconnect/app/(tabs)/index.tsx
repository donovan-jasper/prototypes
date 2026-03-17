import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useActivities } from '../../hooks/useActivities';
import ActivityCard from '../../components/ActivityCard';
import CategoryFilter from '../../components/CategoryFilter';
import RadiusSlider from '../../components/RadiusSlider';

export default function FeedScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [radius, setRadius] = useState(1);
  const { activities, loading, error, refresh } = useActivities(radius, selectedCategory);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Loading activities...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-lg text-red-600 text-center mb-4">{error}</Text>
        <Text className="text-sm text-gray-600 text-center">
          Pull down to try again
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ActivityCard activity={item} />}
        ListHeaderComponent={
          <View>
            <View className="bg-white px-4 pt-4 pb-2">
              <Text className="text-2xl font-bold mb-4 text-gray-900">
                Nearby Activities
              </Text>
              <RadiusSlider value={radius} onChange={setRadius} />
            </View>
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </View>
        }
        ListEmptyComponent={
          <View className="items-center justify-center p-8">
            <Text className="text-lg text-gray-600 text-center mb-2">
              No activities nearby
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              Be the first to post something!
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}
