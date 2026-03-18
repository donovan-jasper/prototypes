import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getAllContent } from '../utils/offlineLibrary';

interface ContentItem {
  id: number;
  title: string;
}

const CommunityScreen = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const navigation = useNavigation<any>();

  const loadContent = useCallback(async () => {
    const result = await getAllContent();
    setContent(result as ContentItem[]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadContent();
    }, [loadContent])
  );

  const handlePress = (id: number, title: string) => {
    navigation.navigate('Thread', { contentId: id, contentTitle: title });
  };

  return (
    <View style={styles.container}>
      {content.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No discussions yet</Text>
          <Text style={styles.emptySubtext}>Download content to start discussing</Text>
        </View>
      ) : (
        <FlatList
          data={content}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => handlePress(item.id, item.title)} 
              style={styles.itemContainer}
            >
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSubtitle}>Tap to view discussion</Text>
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
    backgroundColor: '#f5f5f5',
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
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

export default CommunityScreen;
