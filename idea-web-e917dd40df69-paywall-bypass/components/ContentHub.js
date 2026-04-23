import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ContentService from '../services/ContentService';

const { width } = Dimensions.get('window');

const ContentHub = () => {
  const navigation = useNavigation();
  const [contentSources, setContentSources] = useState([]);
  const [featuredContent, setFeaturedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sources, featured] = await Promise.all([
          ContentService.getContentSources(),
          ContentService.getFeaturedContent()
        ]);
        setContentSources(sources);
        setFeaturedContent(featured);
      } catch (err) {
        setError(err.message || 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSourcePress = (source) => {
    navigation.navigate('ContentSource', { source });
  };

  const handleFeaturedPress = (article) => {
    navigation.navigate('Article', { article });
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
          onError={() => console.log('Failed to load logo for', item.name)}
        />
        <Text style={styles.sourceName}>{item.name}</Text>
        <Text style={styles.sourceDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFeaturedItem = ({ item }) => (
    <TouchableOpacity
      style={styles.featuredItem}
      onPress={() => handleFeaturedPress(item)}
      activeOpacity={0.8}
    >
      {item.image && (
        <Image
          source={{ uri: item.image }}
          style={styles.featuredImage}
          resizeMode="cover"
          onError={() => console.log('Failed to load featured image for', item.title)}
        />
      )}
      <View style={styles.featuredContent}>
        <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.featuredSource}>{item.source}</Text>
      </View>
    </TouchableOpacity>
  );

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
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
            fetchData();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Featured Content</Text>
        {featuredContent.length > 0 ? (
          <FlatList
            data={featuredContent}
            renderItem={renderFeaturedItem}
            keyExtractor={(item) => item.id || Math.random().toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        ) : (
          <Text style={styles.emptyState}>No featured content available</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Premium Content Sources</Text>
        {contentSources.length > 0 ? (
          <FlatList
            data={contentSources}
            renderItem={renderSource}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyState}>No content sources available</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  featuredList: {
    paddingVertical: 8,
  },
  featuredItem: {
    width: width * 0.7,
    marginRight: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featuredImage: {
    width: '100%',
    height: 160,
  },
  featuredContent: {
    padding: 12,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  featuredSource: {
    fontSize: 14,
    color: '#666',
  },
  row: {
    justifyContent: 'space-between',
  },
  sourceContainer: {
    flex: 1,
    marginBottom: 16,
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
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  sourceDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
    backgroundColor: '#f8f8f8',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ContentHub;
