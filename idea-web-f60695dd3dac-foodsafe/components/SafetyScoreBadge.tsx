import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Restaurant } from '@/types';

interface SafetyScoreBadgeProps {
  restaurant: Restaurant;
  size?: 'small' | 'medium' | 'large';
}

const SafetyScoreBadge: React.FC<SafetyScoreBadgeProps> = ({ restaurant, size = 'medium' }) => {
  // Determine badge color based on safety score
  const getBadgeColor = (score: number) => {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= 70) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  // Determine text size based on prop
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 18;
      default:
        return 14;
    }
  };

  // Format inspection date
  const formatInspectionDate = (dateString: string) => {
    if (!dateString || dateString === 'Unknown') return 'No inspection data';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'No inspection data';

    return `Last inspected: ${date.toLocaleDateString()}`;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: getBadgeColor(restaurant.safetyScore) }]}>
        <Text style={[styles.scoreText, { fontSize: getTextSize() }]}>
          {restaurant.safetyScore}
        </Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={[styles.label, { fontSize: getTextSize() * 0.8 }]}>
          Safety Score
        </Text>
        <Text style={[styles.dateText, { fontSize: getTextSize() * 0.7 }]}>
          {formatInspectionDate(restaurant.lastInspectionDate)}
        </Text>
        {restaurant.violationCount > 0 && (
          <Text style={[styles.violationText, { fontSize: getTextSize() * 0.7 }]}>
            {restaurant.violationCount} violation{restaurant.violationCount !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  scoreText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  label: {
    fontWeight: '500',
    color: '#333',
  },
  dateText: {
    color: '#666',
    marginTop: 2,
  },
  violationText: {
    color: '#F44336',
    marginTop: 2,
    fontWeight: '500',
  },
});

export default SafetyScoreBadge;
