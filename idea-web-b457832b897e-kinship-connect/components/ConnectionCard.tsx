import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConnectionCardProps {
  connection: {
    id: string;
    userId: string;
    matchId: string;
    matchName: string;
    matchPhoto: string;
    lastMessage: string;
    lastMessageTime: number;
    unreadCount: number;
  };
  onPress: () => void;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({ connection, onPress }) => {
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} testID="connection-card">
      <Image
        source={{ uri: connection.matchPhoto }}
        style={styles.avatar}
        defaultSource={require('../assets/images/default-avatar.png')}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{connection.matchName}</Text>
          <Text style={styles.time}>{formatTime(connection.lastMessageTime)}</Text>
        </View>
        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {connection.lastMessage}
          </Text>
          {connection.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{connection.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" style={styles.chevron} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 8,
  },
});

export default ConnectionCard;
