import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';

const DatabaseCard = ({ database }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/database/${database.id}`);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Card style={styles.card}>
        <Card.Title
          title={database.name}
          subtitle={`${database.rowCount} rows`}
          right={(props) => (
            <IconButton {...props} icon="delete" onPress={() => {}} />
          )}
        />
        <Card.Content>
          <Text>Last accessed: {database.lastAccessed}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
});

export default DatabaseCard;
