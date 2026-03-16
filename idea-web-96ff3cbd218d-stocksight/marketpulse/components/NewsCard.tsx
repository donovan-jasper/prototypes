import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SentimentBadge from './SentimentBadge';

interface NewsCardProps {
  article: {
    id: string;
    title: string;
    source: string;
    timestamp: string;
    sentiment: number;
  };
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{article.title}</Text>
      <View style={styles.meta}>
        <Text style={styles.source}>{article.source}</Text>
        <Text style={styles.timestamp}>{article.timestamp}</Text>
      </View>
      <SentimentBadge sentiment={article.sentiment} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  source: {
    fontSize: 14,
    color: '#666',
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
  },
});

export default NewsCard;
