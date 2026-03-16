import React from 'react';
import { View, Text, TextInput, StyleSheet, Button } from 'react-native';

interface Goal {
  id: number;
  title: string;
}

interface GoalItemProps {
  goal: Goal;
}

const GoalItem: React.FC<GoalItemProps> = ({ goal }) => {
  return (
    <View style={styles.goal}>
      <TextInput style={styles.input} value={goal.title} onChangeText={(text) => {}} />
      <Button title="Delete" onPress={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  goal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginRight: 10,
  },
});

export default GoalItem;
