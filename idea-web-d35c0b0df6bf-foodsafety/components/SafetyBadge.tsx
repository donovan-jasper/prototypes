import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SafetyBadgeProps {
  grade: string;
  size?: number;
}

const SafetyBadge: React.FC<SafetyBadgeProps> = ({ grade, size = 24 }) => {
  const getColor = () => {
    switch (grade.toUpperCase()) {
      case 'A':
        return '#4CAF50'; // Green
      case 'B':
        return '#FFC107'; // Yellow
      case 'C':
        return '#FF9800'; // Orange
      case 'F':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Gray for unknown
    }
  };

  const getBackgroundColor = () => {
    switch (grade.toUpperCase()) {
      case 'A':
        return 'rgba(76, 175, 80, 0.2)';
      case 'B':
        return 'rgba(255, 193, 7, 0.2)';
      case 'C':
        return 'rgba(255, 152, 0, 0.2)';
      case 'F':
        return 'rgba(244, 67, 54, 0.2)';
      default:
        return 'rgba(158, 158, 158, 0.2)';
    }
  };

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: getBackgroundColor(),
          borderColor: getColor(),
        },
      ]}
    >
      <Text
        style={[
          styles.gradeText,
          {
            fontSize: size * 0.6,
            color: getColor(),
          },
        ]}
      >
        {grade.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  gradeText: {
    fontWeight: 'bold',
  },
});

export default SafetyBadge;
