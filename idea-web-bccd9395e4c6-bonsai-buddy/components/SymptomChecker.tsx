import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { usePlantData } from '../hooks/usePlantData';

export default function SymptomChecker() {
  const [symptom, setSymptom] = useState('');
  const [solutions, setSolutions] = useState<any[]>([]);
  const { getSymptomSolutions } = usePlantData();

  const handleSearch = () => {
    const results = getSymptomSolutions(symptom);
    setSolutions(results);
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        Symptom Checker
      </Text>
      <TextInput
        label="Enter symptom"
        value={symptom}
        onChangeText={setSymptom}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleSearch}>
        Search
      </Button>
      {solutions.map((solution, index) => (
        <View key={index} style={styles.solution}>
          <Text variant="bodyMedium">Cause: {solution.cause}</Text>
          <Text variant="bodySmall">Solution: {solution.solution}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  solution: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
});
