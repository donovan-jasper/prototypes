import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Modal, Text, TouchableOpacity } from 'react-native';
import { useWatchlistStore } from '../../store/watchlistStore';
import { fetchNewsForSymbol } from '../../services/news';
import { analyzeSentiment } from '../../services/sentiment';
import NewsCard from '../../components/NewsCard';
import { NewsArticle } from '../../types/news';
import { explainLikeIm5 } from '../../utils/explainers';

const NewsFeedScreen = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [explanation, setExplanation] = useState('');
  const watchlist = useWatchlistStore(state => state.stocks);

  useEffect(() => {
    const loadNews = async () => {
      if (watchlist.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const allArticles: NewsArticle[] = [];
        for (const symbol of watchlist) {
          const news = await fetchNewsForSymbol(symbol);
          const articlesWithSentiment = await Promise.all(
            news.map(async (article) => ({
              ...article,
              sentiment: await analyzeSentiment(article.title)
            }))
          );
          allArticles.push(...articlesWithSentiment);
        }

        // Sort by date (newest first)
        allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        setArticles(allArticles);
      } catch (error) {
        console.error('Error loading news:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [watchlist]);

  const handleLongPress = async (article: NewsArticle) => {
    setSelectedArticle(article);
    const explanationText = await explainLikeIm5(article);
    setExplanation(explanationText);
  };

  const handleDismiss = (id: string) => {
    setArticles(prev => prev.filter(article => article.id !== id));
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (watchlist.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Add stocks to your watchlist to see personalized news</Text>
      </View>
    );
  }

  if (articles.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No news available for your watchlist</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NewsCard
            article={item}
            onLongPress={() => handleLongPress(item)}
            onDismiss={() => handleDismiss(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={!!selectedArticle}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedArticle(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Explain Like I'm 5</Text>
            <Text style={styles.modalText}>{explanation}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedArticle(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    color: '#444',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NewsFeedScreen;
