import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getBadgeProgress } from '../utils/badgeService';
import { BadgeProgress } from '../types/badge';

export default function BadgesScreen() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<BadgeProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    if (!user) return;
    try {
      const progress = await getBadgeProgress(user.uid);
      setBadges(progress);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBadge = ({ item }: { item: BadgeProgress }) => (
    <View style={[styles.badgeCard, !item.earned && styles.lockedBadge]}>
      <Text style={styles.badgeIcon}>{item.badge.icon}</Text>
      <Text style={styles.badgeName}>{item.badge.name}</Text>
      <Text style={styles.badgeDescription}>{item.badge.description}</Text>
      
      {!item.earned && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(item.progress)}%</Text>
        </View>
      )}
      
      {item.earned && item.earnedAt && (
        <Text style={styles.earnedDate}>
          Earned {new Date(item.earnedAt).toLocaleDateString()}
        </Text>
      )}
    </View>
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
      <Text style={styles.title}>Your Badges</Text>
      <Text style={styles.subtitle}>
        {badges.filter(b => b.earned).length} of {badges.length} earned
      </Text>
      
      <FlatList
        data={badges}
        renderItem={renderBadge}
        keyExtractor={item => item.badge.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24
  },
  grid: {
    paddingBottom: 16
  },
  badgeCard: {
    flex: 1,
    margin: 8,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 180
  },
  lockedBadge: {
    opacity: 0.5
  },
  badgeIcon: {
    fontSize: 48,
    marginBottom: 8
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4
  },
  badgeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12
  },
  progressContainer: {
    width: '100%',
    marginTop: 8
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4
  },
  progressText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center'
  },
  earnedDate: {
    fontSize: 10,
    color: '#999',
    marginTop: 8
  }
});
