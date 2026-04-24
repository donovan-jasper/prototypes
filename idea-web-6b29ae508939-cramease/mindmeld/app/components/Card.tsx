import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CardProps {
  front: string;
  back: string;
  isFlipped: boolean;
}

const Card: React.FC<CardProps> = ({ front, back, isFlipped }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardText}>{isFlipped ? back : front}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 300,
    height: 400,
    backgroundColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardText: {
    fontSize: 20,
    textAlign: 'center',
  },
});

export default Card;
