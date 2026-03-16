import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ContentCardProps {
  title: string;
  duration: number;
  isPremium: boolean;
  onPress: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ title, duration, isPremium, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      testID="content-card"
    >
      <Image
        source={{ uri: 'https://via.placeholder.com/150' }}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.duration}>{duration} minutes</Text>
      </View>
      {isPremium && (
        <View style={styles.premiumBadge}>
          <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
    color: '#8E8E93',
  },
  premiumBadge: {
    backgroundColor: '#007AFF',
    padding: 4,
    borderRadius: 12,
  },
});

export default ContentCard;
