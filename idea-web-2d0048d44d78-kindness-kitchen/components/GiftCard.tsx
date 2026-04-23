import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const GiftCard = ({ gift, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: gift.restaurant.image }} style={styles.image} />

      <View style={styles.infoContainer}>
        <Text style={styles.recipientName}>{gift.recipientName}</Text>
        <Text style={styles.restaurantName}>{gift.restaurant.name}</Text>

        <View style={styles.statusContainer}>
          <Text style={[
            styles.statusText,
            gift.status === 'delivered' && styles.deliveredStatus,
            gift.status === 'pending' && styles.pendingStatus,
          ]}>
            {gift.status}
          </Text>
        </View>

        <Text style={styles.messagePreview}>
          {gift.message.length > 50 ? `${gift.message.substring(0, 50)}...` : gift.message}
        </Text>

        <Text style={styles.deliveryTime}>
          Delivered on {new Date(gift.scheduledFor).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 100,
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    padding: 15,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  restaurantName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  statusContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 10,
    backgroundColor: '#e0e0e0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  deliveredStatus: {
    color: '#4CAF50',
    backgroundColor: '#e8f5e9',
  },
  pendingStatus: {
    color: '#FF9800',
    backgroundColor: '#fff8e1',
  },
  messagePreview: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  deliveryTime: {
    fontSize: 12,
    color: '#999',
  },
});

export default GiftCard;
