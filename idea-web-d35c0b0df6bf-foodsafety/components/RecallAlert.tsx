import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecallAlert as RecallAlertType } from '@/types';

interface RecallAlertProps {
  alert: RecallAlertType;
  onPress?: () => void;
}

const RecallAlert: React.FC<RecallAlertProps> = ({ alert, onPress }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return '#ff3b30';
      case 'medium':
        return '#ff9500';
      case 'low':
        return '#34c759';
      default:
        return '#666';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'alert-circle';
      case 'medium':
        return 'alert';
      case 'low':
        return 'information-circle';
      default:
        return 'information-circle';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !alert.isRead && styles.unread
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Ionicons
          name={getSeverityIcon(alert.severity)}
          size={20}
          color={getSeverityColor(alert.severity)}
          style={styles.icon}
        />
        <Text style={styles.date}>
          {new Date(alert.recallDate).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.description}>{alert.description}</Text>
      <View style={styles.footer}>
        <Text style={[styles.severity, { color: getSeverityColor(alert.severity) }]}>
          {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} severity
        </Text>
        {!alert.isRead && (
          <View style={styles.unreadDot} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  severity: {
    fontSize: 14,
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
});

export default RecallAlert;
