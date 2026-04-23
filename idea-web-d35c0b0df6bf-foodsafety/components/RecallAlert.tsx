import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RecallAlertProps {
  recallDate: string;
  description: string;
}

const RecallAlert: React.FC<RecallAlertProps> = ({ recallDate, description }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle" size={24} color="#ff3b30" />
      </View>
      <View style={styles.content}>
        <Text style={styles.date}>
          {new Date(recallDate).toLocaleDateString()}
        </Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff3b30',
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  date: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff3b30',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#333',
  },
});

export default RecallAlert;
