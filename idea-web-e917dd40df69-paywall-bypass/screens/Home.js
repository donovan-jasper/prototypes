import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ContentHub from '../components/ContentHub';
import ContentService from '../services/ContentService';

const Home = () => {
  const navigation = useNavigation();
  const [articles, setArticles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadArticles = async () => {
    try {
      const savedArticles = await ContentService.getSavedArticles();
      setArticles(savedArticles);
    } catch (error) {
      console.log('Error loading articles:', error);
    }
  };

  useEffect(() => {
    loadArticles();

    const unsubscribe = navigation.addListener('focus', () => {
      loadArticles();
    });

    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadArticles();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const renderArticle = ({ item }) => (
    <TouchableOpacity
      style={styles.articleCard}
      onPress={() => navigation.navigate('ArticleView', { article: item })}
    >
      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.articleImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.articleContent}>
        <Text style={styles.articleSource}>{item.source}</Text>
        <Text style={styles.articleTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.articlePreview} numberOfLines={2}>
          {item.content}
        </Text>
        <View style={styles.articleMeta}>
          <Text style={styles.articleAuthor}>{item.author}</Text>
          <Text style={styles.articleDate}>{formatDate(item.fetchedAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No saved articles yet</Text>
      <Text style={styles.emptyText}>
        Tap the + button to add your first article
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('AddArticle')}
      >
        <Text style={styles.emptyButtonText}>Add Article</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Librio</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddArticle')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ContentHub />

      <View style={styles.savedSection}>
        <Text style={styles.sectionHeader}>Saved Articles</Text>
        <FlatList
          data={articles}
          renderItem={renderArticle}
          keyExtractor={(item) => item.url}
          contentContainerStyle={articles.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
    marginTop: -4,
  },
  savedSection: {
    flex: 1,
    marginTop: 16,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    paddingHorizontal: 16,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  articleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  articleImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  articleContent: {
    padding: 16,
  },
  articleSource: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  articlePreview: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleAuthor: {
    fontSize: 12,
    color: '#666',
  },
  articleDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Home;
