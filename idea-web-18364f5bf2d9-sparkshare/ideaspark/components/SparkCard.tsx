import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import CategoryBadge from './CategoryBadge';

export default function SparkCard({ idea }) {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push(`/idea/${idea.id}`)}>
      <View style={styles.card}>
        <Text style={styles.title}>{idea.title}</Text>
        <Text style={styles.description}>{idea.description}</Text>
        <CategoryBadge category={idea.category} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginVertical: 5,
  },
});
