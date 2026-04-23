import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Hangout {
  id: string;
  title: string;
  hobby: string;
  distance: number;
  startTime: string;
  attendees: number;
  maxAttendees: number;
}

interface HangoutCardProps {
  hangout: Hangout;
  onJoin: (hangoutId: string) => void;
  onPress: () => void;
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = date.getTime() - now.getTime();

  const minutes = Math.round(diff / (1000 * 60));
  const hours = Math.round(diff / (1000 * 60 * 60));
  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  if (minutes < 0) return 'Ended';
  if (minutes < 60) return `in ${minutes} min`;
  if (hours < 24) return `in ${hours} hr${hours > 1 ? 's' : ''}`;
  if (days < 7) return `in ${days} day${days > 1 ? 's' : ''}`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
};

const HobbyTag = ({ hobby }: { hobby: string }) => {
  const hobbyIcons: Record<string, string> = {
    'board-games': 'dice',
    'fitness': 'barbell',
    'hiking': 'trail-sign',
    'reading': 'book',
    'photography': 'camera',
    'music': 'musical-notes',
    'cooking': 'restaurant',
    'art': 'color-palette',
    'default': 'heart',
  };

  const iconName = hobbyIcons[hobby] || hobbyIcons['default'];

  return (
    <View style={styles.hobbyTag}>
      <Ionicons name={iconName} size={14} color="#007AFF" style={styles.hobbyIcon} />
      <Text style={styles.hobbyText}>{hobby}</Text>
    </View>
  );
};

const HangoutCard: React.FC<HangoutCardProps> = ({ hangout, onJoin, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{hangout.title}</Text>
        <HobbyTag hobby={hangout.hobby} />
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{formatTime(hangout.startTime)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{hangout.distance.toFixed(1)} mi away</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{hangout.attendees}/{hangout.maxAttendees} attending</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => onJoin(hangout.id)}
      >
        <Text style={styles.joinButtonText}>Join</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  hobbyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F0FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  hobbyIcon: {
    marginRight: 4,
  },
  hobbyText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  cardDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  joinButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HangoutCard;
