import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format } from 'date-fns';

interface RecallAlertProps {
  recallDate: string;
  description: string;
}

const RecallAlert: React.FC<RecallAlertProps> = ({ recallDate, description }) => {
  const formattedDate = format(new Date(recallDate), 'MMMM d, yyyy');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recall Alert</Text>
      <Text style={styles.date}>{formattedDate}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.warningBox}>
        <Text style={styles.warningText}>This establishment has been recalled. Exercise caution when consuming food from this location.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff3b30',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff3b30',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  warningBox: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 4,
  },
  warningText: {
    color: '#c62828',
    fontSize: 14,
  },
});

export default RecallAlert;
