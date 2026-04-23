import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ContentService } from '../services/ContentService';

const ContentHub = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const contentSources = [
    {
      name: 'NYTimes',
      url: 'https://www.nytimes.com',
      logo: 'https://static01.nyt.com/images/icons/t_logo_291_black.png',
      apiEndpoint: 'https://api.nytimes.com/svc/topstories/v2/home.json?api-key=YOUR_API_KEY'
    },
    {
      name: 'WSJ',
      url: 'https://www.wsj.com',
      logo: 'https://www.wsj.com/apple-touch-icon.png',
      apiEndpoint: 'https://newsapi.org/v2/top-headlines?sources=the-wall-street-journal&apiKey=YOUR_API_KEY'
    },
    {
      name: 'Medium',
      url: 'https://medium.com',
      logo: 'https://miro.medium.com/max/1400/1*jJbQJXz5QJQJQJQJQJQJQJ.png',
      apiEndpoint: 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fmedium.com%2Ffeed%2F'
    }
  ];

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const fetchedArticles = [];

        for (const source of contentSources) {
          try {
            const response = await ContentService.fetchFromSource(source.apiEndpoint);
            const sourceArticles = response.articles || response.items || [];

            sourceArticles.slice(0, 5).forEach(article => {
              fetchedArticles.push({
                id: article.url || article.link,
                title: article.title,
                excerpt: article.description || article.content_snippet || article.description,
                source: source.name,
                logo: source.logo,
                url: article.url || article.link,
                publishedAt: article.publishedAt || article.pubDate
              });
            });
          } catch (err) {
            console.error(`Error fetching from ${source.name}:`, err);
          }
        }

        setArticles(fetchedArticles);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const renderArticle = ({ item }) => (
    <TouchableOpacity style={styles.articleContainer} onPress={() => handleArticlePress(item.url)}>
      <View style={styles.articleHeader}>
        <Image source={{ uri: item.logo }} style={styles.sourceLogo} />
        <Text style={styles.sourceName}>{item.source}</Text>
      </View>
      <Text style={styles.articleTitle}>{item.title}</Text>
      <Text style={styles.articleExcerpt} numberOfLines={3}>{item.excerpt}</Text>
    </TouchableOpacity>
  );

  const handleArticlePress = (url) => {
    // Implement navigation to article detail screen
    console.log('Article pressed:', url);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading premium content...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading content: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Premium Content Hub</Text>
      <FlatList
        data={articles}
        renderItem={renderArticle}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  articleContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  sourceName: {
    fontSize: 14,
    color: '#666',
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  articleExcerpt: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default ContentHub;
