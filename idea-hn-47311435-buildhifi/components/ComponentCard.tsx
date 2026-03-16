import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import CompatibilityBadge from './CompatibilityBadge';
import { Component } from '@/lib/types';

interface ComponentCardProps {
  component: Component;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ component }) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{component.name}</Title>
        <Paragraph>{component.brand}</Paragraph>
        <Paragraph>${component.price}</Paragraph>
        <View style={styles.badges}>
          <CompatibilityBadge status="compatible" />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  badges: {
    flexDirection: 'row',
    marginTop: 8,
  },
});

export default ComponentCard;
