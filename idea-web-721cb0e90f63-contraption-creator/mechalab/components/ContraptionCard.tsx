import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';

const ContraptionCard = ({ contraption, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Card style={styles.card}>
        <Card.Cover source={{ uri: contraption.thumbnail }} />
        <Card.Content>
          <Title>{contraption.name}</Title>
          {contraption.isPremium && (
            <Paragraph style={styles.premium}>Premium</Paragraph>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
  },
  card: {
    flex: 1,
  },
  premium: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
});

export default ContraptionCard;
