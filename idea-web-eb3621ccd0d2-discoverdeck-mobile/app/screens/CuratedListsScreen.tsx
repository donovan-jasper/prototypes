import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { mockApps } from '../utils/mockApps';
import { AppRecommendation } from '../types/app';

interface CategoryGroup {
  category: string;
  apps: AppRecommendation[];
}

const CuratedListsScreen = () => {
  const groupAppsByCategory = (): CategoryGroup[] => {
    const categoriesMap = new Map<string, AppRecommendation[]>();

    mockApps.forEach(app => {
      app.categories.forEach(category => {
        if (!categoriesMap.has(category)) {
          categoriesMap.set(category, []);
        }
        categoriesMap.get(category)?.push(app);
      });
    });

    return Array.from(categoriesMap.entries()).map(([category, apps]) => ({
      category,
      apps: apps.slice(0, 5) // Limit to top 5 apps per category
    }));
  };

  const curatedLists = groupAppsByCategory();

  const renderCategoryItem = ({ item }: { item: CategoryGroup }) => (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{item.category}</Text>
      <FlatList
        horizontal
        data={item.apps}
        renderItem={({ item: app }) => (
          <TouchableOpacity style={styles.appCard} onPress={() => console.log('App selected:', app.name)}>
            <Image source={{ uri: app.iconUrl }} style={styles.appIcon} />
            <Text style={styles.appName} numberOfLines={1}>{app.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(app) => app.id}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Curated Lists</Text>
      <Text style={styles.subtitle}>Expert-picked recommendations</Text>

      <FlatList
        data={curatedLists}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.category}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  appCard: {
    width: 100,
    marginRight: 12,
    alignItems: 'center',
  },
  appIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: 8,
  },
  appName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
});

export default CuratedListsScreen;
