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
      <View style={styles.header}>
        <Text style={styles.title}>⚠️ Recall Alert</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.warningBox}>
        <Text style={styles.warningText}>
          This establishment has been recalled. Exercise caution when consuming food from this location.
          Please check with the establishment for more information about affected products.
        </Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff3b30',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    lineHeight: 22,
  },
  warningBox: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#c62828',
  },
  warningText: {
    color: '#c62828',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default RecallAlert;
