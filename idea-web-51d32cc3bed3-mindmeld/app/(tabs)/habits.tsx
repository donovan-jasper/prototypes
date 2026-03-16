import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useHabits } from '../../store/habits';
import HabitCard from '../../components/HabitCard';

export default function HabitsScreen() {
  const { habits, fetchHabits } = useHabits();

  useEffect(() => {
    fetchHabits();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Habits</Text>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HabitCard habit={item} />}
        ListEmptyComponent={<Text style={styles.empty}>No habits yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
});
