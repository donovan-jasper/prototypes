import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NudgeNotification = ({ friend, onDismiss }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="notifications" size={24} color="#FF6B6B" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Time to catch up with {friend.name}!</Text>
          <Text style={styles.message}>How about sharing a recent memory?</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
        <Text style={styles.dismissText}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 10,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  dismissButton: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  dismissText: {
    color: '#FF6B6B',
    fontSize: 14,
  },
});

export default NudgeNotification;
