import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';

export default function QueryResults({ results }) {
  return (
    <View style={styles.container}>
      <FlatList
        data={results}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              {Object.entries(item).map(([key, value]) => (
                <View key={key} style={styles.row}>
                  <Title>{key}</Title>
                  <Paragraph>{value}</Paragraph>
                </View>
              ))}
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
  },
  card: {
    marginBottom: 16,
  },
  row: {
    marginBottom: 8,
  },
});
