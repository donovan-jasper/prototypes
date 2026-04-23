import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { NewsArticle } from '../types/news';
import SentimentBadge from './SentimentBadge';
import { formatRelativeTime } from '../utils/formatters';

interface NewsCardProps {
  article: NewsArticle;
  onDismiss: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, onDismiss }) => {
  const handlePress = () => {
    if (article.url) {
      Linking.openURL(article.url).catch(() => {
        Alert.alert('Error', 'Could not open the article link');
      });
    }
  };

  const handleLongPress = () => {
    Alert.alert(
      'Explain Like I\'m 5',
      `This article is about ${article.title.toLowerCase()}. It was published by ${article.source.name} ${formatRelativeTime(article.publishedAt)}.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.source}>{article.source.name}</Text>
        <SentimentBadge sentiment={article.sentimentLabel} />
      </View>
      <Text style={styles.title} numberOfLines={2}>{article.title}</Text>
      {article.description && (
        <Text style={styles.description} numberOfLines={3}>
          {article.description}
        </Text>
      )}
      <View style={styles.footer}>
        <Text style={styles.time}>{formatRelativeTime(article.publishedAt)}</Text>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={onDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  source: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
  time: {
    fontSize: 12,
    color: '#999',
  },
  dismissButton: {
    padding: 8,
  },
  dismissText: {
    fontSize: 12,
    color: '#007aff',
    fontWeight: '500',
  },
});

export default NewsCard;
