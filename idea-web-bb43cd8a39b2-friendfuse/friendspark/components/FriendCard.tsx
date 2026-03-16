import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import StreakBadge from './StreakBadge';

const FriendCard = ({ friend, streak, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{friend.name.charAt(0)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{friend.name}</Text>
        <StreakBadge streak={streak} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FriendCard;
