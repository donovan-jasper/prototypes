import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MessageItem({ message }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/message/${message.id}`)}
    >
      <View style={styles.header}>
        <Text style={styles.buyerName}>{message.buyerName}</Text>
        <Text style={styles.timestamp}>{message.timestamp}</Text>
      </View>
      <Text style={styles.content}>{message.content}</Text>
      <View style={styles.platform}>
        <MaterialIcons
          name={getPlatformIcon(message.platform)}
          size={16}
          color="#666"
        />
        <Text style={styles.platformText}>{message.platform}</Text>
      </View>
      {!message.read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );
}

function getPlatformIcon(platform) {
  switch (platform) {
    case 'TikTok Shop':
      return 'shopping-cart';
    case 'Instagram Shopping':
      return 'camera-alt';
    case 'Facebook Marketplace':
      return 'store';
    default:
      return 'message';
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  buyerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    fontSize: 14,
    marginBottom: 8,
  },
  platform: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
});
