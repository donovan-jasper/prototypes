import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Directory } from '@/lib/database';
import { Category } from '@/constants/categories';

interface DirectoryCardProps {
  directory: Directory;
  onPress: () => void;
  showPriorityScore?: boolean;
}

const DirectoryCard: React.FC<DirectoryCardProps> = ({
  directory,
  onPress,
  showPriorityScore = false
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'App Stores':
        return '#FF5722';
      case 'Startup Lists':
        return '#4CAF50';
      case 'Dev Tools':
        return '#2196F3';
      case 'Communities':
        return '#9C27B0';
      case 'Newsletters':
        return '#FFC107';
      default:
        return '#607D8B';
    }
  };

  const formatApprovalRate = (rate: number) => {
    return `${Math.round(rate * 100)}%`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>{directory.name}</Text>
        {directory.isPremium && (
          <MaterialIcons name="lock" size={16} color="#FF5722" style={styles.premiumIcon} />
        )}
      </View>

      <View style={styles.categoryContainer}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(directory.category) }]}>
          <Text style={styles.categoryText}>{directory.category}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>DR</Text>
          <Text style={styles.statValue}>{directory.drScore}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Approval</Text>
          <Text style={styles.statValue}>{formatApprovalRate(directory.approvalRate)}</Text>
        </View>

        {showPriorityScore && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Priority</Text>
            <Text style={styles.statValue}>
              {directory.priorityScore ? directory.priorityScore.toFixed(1) : 'N/A'}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {directory.description}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  premiumIcon: {
    marginLeft: 4,
  },
  categoryContainer: {
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

export default DirectoryCard;
