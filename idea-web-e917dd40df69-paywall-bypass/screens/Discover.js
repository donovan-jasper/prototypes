import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  getSelectedCategories,
  getArticlesByCategory,
  getRecommendedArticles,
  searchArticles,
} from '../services/ContentService';

const Discover = ({ navigation }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryArticles, setCategoryArticles] = useState({});
  const [recommendedArticles, setRecommendedArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadContent();
    });
    return unsubscribe;
  }, [navigation]);

  const loadContent = async () => {
    try {
      const categories = await getSelectedCategories();
      setSelectedCategories(categories);

      const articlesMap = {};
      for (const category of categories) {
        const articles = await getArticlesByCategory(category);
        if (articles.length > 0) {
          articlesMap[category] = articles.slice(0, 5);
        }
      }
      setCategoryArticles(articlesMap);

      const recommended = await getRecommendedArticles();
      setRecommendedArticles(recommended);
    } catch (error) {
      console.log('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    try {
      const results = await searchArticles(query.trim());
      setSearchResults(results);
    } catch (error) {
      console.log('Search error:', error);
    } finally {
      setSearching(false);
    }
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

  const renderArticleCard = (article, compact = false) => (
    <TouchableOpacity
      key={article.url}
      style={compact ? styles.compactCard : styles.articleCard}
      onPress={() => navigation.navigate('ArticleView', { article })}
    >
      {article.imageUrl && (
        <Image
          source={{ uri: article.imageUrl }}
          style={compact ? styles.compactImage : styles.articleImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.articleContent}>
        <Text style={styles.articleSource}>{article.source}</Text>
        <Text style={styles.articleTitle} numberOfLines={2}>
          {article.title}
        </Text>
        {!compact && (
          <Text style={styles.articlePreview} numberOfLines={2}>
            {article.content}
          </Text>
        )}
        <Text style={styles.articleDate}>{formatDate(article.fetchedAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search articles..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {searchQuery.trim().length >= 2 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Search Results {searching && '...'}
            </Text>
            {searchResults.length === 0 && !searching ? (
              <Text style={styles.emptyText}>No articles found</Text>
            ) : (
              searchResults.map(article => renderArticleCard(article))
            )}
          </View>
        ) : (
          <>
            {recommendedArticles.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recommended for You</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {recommendedArticles.slice(0, 5).map(article => (
                    <View key={article.url} style={styles.recommendedCard}>
                      {renderArticleCard(article, true)}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {selectedCategories.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No interests selected</Text>
                <Text style={styles.emptyText}>
                  Go to Settings to select topics you're interested in
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate('Settings')}
                >
                  <Text style={styles.emptyButtonText}>Select Interests</Text>
                </TouchableOpacity>
              </View>
            ) : (
              Object.entries(categoryArticles).map(([category, articles]) => (
                <View key={category} style={styles.section}>
                  <Text style={styles.sectionTitle}>{category}</Text>
                  {articles.map(article => renderArticleCard(article))}
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 4,
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
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
  compactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    width: 280,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recommendedCard: {
    marginRight: 12,
  },
  articleImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  compactImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#f0f0f0',
  },
  articleContent: {
    padding: 16,
  },
  articleSource: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
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
    lineHeight: 20,
    marginBottom: 8,
  },
  articleDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
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
    fontWeight: '600',
  },
});

export default Discover;
