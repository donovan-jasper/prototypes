import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Title, Button } from 'react-native-paper';
import { listTemplates } from '../lib/templates';

interface TemplateSelectorProps {
  onSelect: (template: any) => void;
}

export default function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const templates = listTemplates();

  return (
    <View style={styles.container}>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Title>{item.name}</Title>
              <Button mode="contained" onPress={() => onSelect(item)}>
                Use Template
              </Button>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
});
