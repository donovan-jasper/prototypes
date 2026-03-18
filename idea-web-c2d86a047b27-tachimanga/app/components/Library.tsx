import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getAllContentWithProgress } from '../utils/offlineLibrary';

interface ContentItem {
  id: number;
  title: string;
  text: string;
  scroll_position: number;
  percentage_complete: number;
}

const Library = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const navigation = useNavigation<any>();

  const loadContent = useCallback(async () => {
    const result = await getAllContentWithProgress();
    setContent(result as ContentItem[]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadContent();
    }, [loadContent])
  );

  const handlePress = (id: number) => {
    navigation.navigate('Reader', { contentId: id });
  };

  const renderProgressBar = (percentage: number) => {
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(percentage)}%</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {content.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No content yet</Text>
          <Text style={styles.emptySubtext}>Download content from the Discover tab</Text>
        </View>
      ) : (
        <FlatList
          data={content}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePress(item.id)} style={styles.itemContainer}>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {renderProgressBar(item.percentage_complete)}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  itemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemContent: {
    padding: 16,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    width: 40,
    textAlign: 'right',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});

export default Library;
