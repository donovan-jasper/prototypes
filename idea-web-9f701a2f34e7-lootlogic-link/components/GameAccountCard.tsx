import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Account {
  game: string;
  username: string;
}

interface GameAccountCardProps {
  account: Account;
}

const GameAccountCard: React.FC<GameAccountCardProps> = ({ account }) => {
  return (
    <View style={styles.card}>
      <Text>{account.game}</Text>
      <Text>{account.username}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default GameAccountCard;
