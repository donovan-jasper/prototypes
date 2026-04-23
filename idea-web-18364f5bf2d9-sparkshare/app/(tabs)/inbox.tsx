import React, { useState, useEffect, useContext } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Avatar, Badge, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getFeedbackNotifications, markNotificationAsRead } from '../../lib/feedback';
import { AuthContext } from '../../context/AuthContext';

const FeedbackInbox = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        try {
          const data = await getFeedbackNotifications(user.id);
          setNotifications(data);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchNotifications();
  }, [user]);

  const handleNotificationPress = async (notification) => {
    try {
      if (notification.unread) {
        await markNotificationAsRead(notification.id);
        setNotifications(prev => prev.map(n =>
          n.id === notification.id ? { ...n, unread: false } : n
        ));
      }
      router.push(`/idea/${notification.idea_id}`);
    } catch (error) {
      console.error('Error handling notification press:', error);
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity onPress={() => handleNotificationPress(item)}>
      <View style={styles.notificationContainer}>
        <Avatar.Text
          size={40}
          label={item.commenter_username.charAt(0).toUpperCase()}
          style={styles.avatar}
        />
        <View style={styles.content}>
          <Text style={styles.username}>{item.commenter_username}</Text>
          <Text numberOfLines={2} style={styles.comment}>
            {item.comment_text}
          </Text>
          <Text style={styles.time}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        {item.unread && <Badge style={styles.badge} />}
      </View>
      <Divider />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Feedback Inbox</Text>
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No feedback yet</Text>
          <Text style={styles.emptySubtext}>When someone comments on your ideas, you'll see them here</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
  notificationContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  username: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  comment: {
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  badge: {
    backgroundColor: '#6200EE',
    marginLeft: 8,
  },
  list: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#666',
  },
});

export default FeedbackInbox;
