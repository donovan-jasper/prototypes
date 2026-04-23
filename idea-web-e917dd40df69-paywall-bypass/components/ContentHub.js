import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ContentService } from '../services/ContentService';

const { width } = Dimensions.get('window');

const ContentHub = () => {
  const navigation = useNavigation();
  const [contentSources, setContentSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const predefinedSources = [
    {
      id: 'nytimes',
      name: 'The New York Times',
      description: 'Premium news and analysis from the world\'s leading newspaper',
      logo: 'https://static01.nyt.com/images/icons/t_logo_291_black.png',
      apiEndpoint: 'https://api.nytimes.com/svc/topstories/v2/home.json?api-key=YOUR_API_KEY'
    },
    {
      id: 'wsj',
      name: 'The Wall Street Journal',
      description: 'Business news and financial analysis',
      logo: 'https://www.wsj.com/apple-touch-icon.png',
      apiEndpoint: 'https://newsapi.org/v2/top-headlines?sources=the-wall-street-journal&apiKey=YOUR_API_KEY'
    },
    {
      id: 'medium',
      name: 'Medium',
      description: 'Stories and ideas from writers on any topic',
      logo: 'https://miro.medium.com/max/1400/1*jJbQJXz5QJQJQJQJQJQJQJ.png',
      apiEndpoint: 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fmedium.com%2Ffeed%2F'
    },
    {
      id: 'wired',
      name: 'Wired',
      description: 'The future of business, innovation, and culture',
      logo: 'https://www.wired.com/wp-content/themes/wired/assets/images/wired-logo.png',
      apiEndpoint: 'https://www.wired.com/feed/rss'
    },
    {
      id: 'theatlantic',
      name: 'The Atlantic',
      description: 'Politics, culture, and ideas from America\'s leading magazine',
      logo: 'https://cdn.theatlantic.com/assets/media/img/logo-default.png',
      apiEndpoint: 'https://www.theatlantic.com/feed/all/'
    },
    {
      id: 'npr',
      name: 'NPR',
      description: 'News, analysis, and commentary from NPR',
      logo: 'https://media.npr.org/images/nprlogo_600x336.png',
      apiEndpoint: 'https://feeds.npr.org/1001/rss.xml'
    }
  ];

  useEffect(() => {
    const fetchContentSources = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch this from your backend
        setContentSources(predefinedSources);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContentSources();
  }, []);

  const handleSourcePress = (source) => {
    navigation.navigate('ContentSource', { source });
  };

  const renderSource = ({ item }) => (
    <TouchableOpacity
      style={styles.sourceContainer}
      onPress={() => handleSourcePress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.sourceCard}>
        <Image
          source={{ uri: item.logo }}
          style={styles.sourceLogo}
          resizeMode="contain"
        />
        <Text style={styles.sourceName}>{item.name}</Text>
        <Text style={styles.sourceDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading premium content sources...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading content sources: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Premium Content Sources</Text>
      <Text style={styles.subHeader}>Explore top news outlets and magazines</Text>

      <FlatList
        data={contentSources}
        renderItem={renderSource}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
    marginBottom: 8,
    color: '#333',
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  sourceContainer: {
    flex: 1,
    margin: 8,
  },
  sourceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    height: 200,
    justifyContent: 'center',
  },
  sourceLogo: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  sourceDescription: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  row: {
    justifyContent: 'space-between',
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
