import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { NewsArticle } from '../types/news';
import SentimentBadge from './SentimentBadge';
import { formatRelativeTime } from '../utils/formatters';

interface NewsCardProps {
  article: NewsArticle;
  onDismiss: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, onDismiss }) => {
  const handlePress = () => {
    Linking.openURL(article.url);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.symbol}>{article.symbol}</Text>
        <SentimentBadge sentiment={article.sentimentLabel} />
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {article.title}
      </Text>

      {article.description && (
        <Text style={styles.description} numberOfLines={3}>
          {article.description}
        </Text>
      )}

      <View style={styles.footer}>
        <Text style={styles.source}>{article.source.name}</Text>
        <Text style={styles.time}>{formatRelativeTime(article.publishedAt)}</Text>
      </View>

      <TouchableOpacity
        style={styles.dismissButton}
        onPress={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
      >
        <Text style={styles.dismissText}>Dismiss</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  symbol: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  source: {
    fontSize: 12,
    color: '#999',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  dismissButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  dismissText: {
    fontSize: 12,
    color: '#999',
  },
});

export default NewsCard;
