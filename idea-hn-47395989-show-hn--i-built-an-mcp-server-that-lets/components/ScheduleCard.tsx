import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { ScheduledPost } from '@/types';
import { deleteScheduledPost } from '@/lib/db';

interface ScheduleCardProps {
  post: ScheduledPost;
  onDelete: (id: string) => void;
}

export default function ScheduleCard({ post, onDelete }: ScheduleCardProps) {
  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 1) {
      return `in ${diffDays} days`;
    } else if (diffDays === 1) {
      return 'tomorrow';
    } else if (diffHours > 0) {
      return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else {
      return 'soon';
    }
  };

  const formatDateTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'threads':
        return 'Threads';
      case 'bluesky':
        return 'Bluesky';
      case 'both':
        return 'Threads + Bluesky';
      default:
        return platform;
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this scheduled post?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteScheduledPost(post.id);
              onDelete(post.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete post. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    Alert.alert('Coming Soon', 'Edit functionality will be available soon.');
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeRelative}>{formatDate(post.scheduledFor)}</Text>
          <Text style={styles.timeAbsolute}>{formatDateTime(post.scheduledFor)}</Text>
        </View>
        <View style={styles.platformBadge}>
          <Text style={styles.platformText}>{getPlatformLabel(post.platform)}</Text>
        </View>
      </View>

      <Text style={styles.content} numberOfLines={4}>
        {post.content}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  timeContainer: {
    flex: 1,
  },
  timeRelative: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  timeAbsolute: {
    fontSize: 14,
    color: '#666',
  },
  platformBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  platformText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF3B30',
  },
});
