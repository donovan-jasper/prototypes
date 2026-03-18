import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import CompatibilityBadge from './CompatibilityBadge';
import { Component } from '@/lib/types';

interface ComponentCardProps {
  component: Component;
  validationStatus?: 'compatible' | 'warning' | 'incompatible';
}

const ComponentCard: React.FC<ComponentCardProps> = ({ component, validationStatus = 'compatible' }) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{component.name}</Title>
        <Paragraph>{component.brand}</Paragraph>
        <Paragraph>${component.price}</Paragraph>
        
        <View style={styles.specs}>
          {component.specs.impedance && (
            <Paragraph style={styles.spec}>Impedance: {component.specs.impedance}Ω</Paragraph>
          )}
          {component.specs.powerWatts && (
            <Paragraph style={styles.spec}>Power: {component.specs.powerWatts}W</Paragraph>
          )}
          {component.specs.maxPowerWatts && (
            <Paragraph style={styles.spec}>Max Power: {component.specs.maxPowerWatts}W</Paragraph>
          )}
        </View>

        <View style={styles.badges}>
          <CompatibilityBadge status={validationStatus} />
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
  specs: {
    marginTop: 8,
  },
  spec: {
    fontSize: 12,
    color: '#666',
  },
});

export default ComponentCard;
