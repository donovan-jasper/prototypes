import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

const GiftCard = ({ gift }) => {
  return (
    <Link href={`/gift/${gift.id}`} asChild>
      <TouchableOpacity style={styles.card}>
        <Text style={styles.recipient}>{gift.recipientName}</Text>
        <Text style={styles.restaurant}>{gift.restaurant}</Text>
        <Text style={styles.message}>{gift.message}</Text>
        <Text style={[styles.status, styles[gift.status]]}>{gift.status}</Text>
      </TouchableOpacity>
    </Link>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recipient: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  restaurant: {
    fontSize: 16,
    marginBottom: 5,
  },
  message: {
    fontSize: 14,
    marginBottom: 10,
  },
  status: {
    fontSize: 14,
    padding: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  preparing: {
    backgroundColor: '#FFEB3B',
    color: '#000',
  },
  enroute: {
    backgroundColor: '#2196F3',
    color: 'white',
  },
  delivered: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
});

export default GiftCard;
