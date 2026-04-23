import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCollaboration } from '../hooks/useCollaboration';

const CollaborationBar = () => {
  const { activeUsers, currentUser } = useCollaboration();

  if (!activeUsers || activeUsers.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.userList}>
        {activeUsers.map((user) => (
          <View key={user.id} style={styles.user}>
            <View style={[
              styles.avatar,
              { backgroundColor: user.color },
              user.id === currentUser?.id && styles.currentUserAvatar
            ]}>
              <Text style={styles.avatarText}>
                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            {user.id === currentUser?.id && (
              <Text style={styles.currentUserLabel}>You</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 100,
  },
  userList: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 8,
  },
  user: {
    marginRight: 8,
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  currentUserAvatar: {
    borderColor: '#4CAF50',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  currentUserLabel: {
    color: '#4CAF50',
    fontSize: 10,
    marginTop: 2,
  },
});

export default CollaborationBar;
