import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Avatar } from 'react-native-paper';

const DatabaseCard = ({ database, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(database.id)} testID="database-card">
      <Card style={styles.card}>
        <Card.Title
          title={database.name}
          subtitle={database.type}
          left={(props) => <Avatar.Icon {...props} icon="database" />}
          right={(props) => (
            <View style={styles.rightContent}>
              <Text style={styles.syncText}>
                Last sync: {database.lastSync.toLocaleString()}
              </Text>
            </View>
          )}
        />
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  rightContent: {
    marginRight: 16,
    justifyContent: 'center',
  },
  syncText: {
    fontSize: 12,
    color: 'gray',
  },
});

export default DatabaseCard;
