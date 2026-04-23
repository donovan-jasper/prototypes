import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SafetyBadgeProps {
  grade: string;
  size?: number;
}

const SafetyBadge: React.FC<SafetyBadgeProps> = ({ grade, size = 32 }) => {
  // Determine color based on grade
  let backgroundColor = '#e0e0e0';
  let textColor = '#333';

  switch (grade.toUpperCase()) {
    case 'A':
      backgroundColor = '#4CAF50';
      textColor = 'white';
      break;
    case 'B':
      backgroundColor = '#FFC107';
      textColor = '#333';
      break;
    case 'C':
      backgroundColor = '#FF9800';
      textColor = 'white';
      break;
    case 'F':
      backgroundColor = '#F44336';
      textColor = 'white';
      break;
    default:
      backgroundColor = '#e0e0e0';
      textColor = '#333';
  }

  return (
    <View style={[
      styles.badge,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor,
      }
    ]}>
      <Text style={[
        styles.gradeText,
        {
          fontSize: size * 0.6,
          color: textColor,
        }
      ]}>
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
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  gradeText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SafetyBadge;
