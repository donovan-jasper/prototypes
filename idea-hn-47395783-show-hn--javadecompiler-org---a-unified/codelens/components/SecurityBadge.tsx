import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SecurityBadgeProps {
  severity: 'critical' | 'high' | 'medium' | 'low';
  size?: 'small' | 'medium' | 'large';
}

const SecurityBadge: React.FC<SecurityBadgeProps> = ({ severity, size = 'medium' }) => {
  const getSeverityColor = () => {
    switch (severity) {
      case 'critical':
        return '#d32f2f';
      case 'high':
        return '#f57c00';
      case 'medium':
        return '#ffc107';
      case 'low':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  const getSeverityText = () => {
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 4,
          fontSize: 10,
        };
      case 'large':
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
          fontSize: 14,
        };
      default:
        return {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 6,
          fontSize: 12,
        };
    }
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${getSeverityColor()}20`,
          borderColor: getSeverityColor(),
        },
        getSizeStyles(),
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: getSeverityColor() },
          getSizeStyles(),
        ]}
      >
        {getSeverityText()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SecurityBadge;
