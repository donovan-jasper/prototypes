import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Card, Divider } from 'react-native-paper';
import { getSymptomSolutions } from '../lib/plantData';

export default function SymptomChecker() {
  const [symptom, setSymptom] = useState('');
  const [solutions, setSolutions] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = () => {
    if (symptom.trim() === '') {
      setSolutions([]);
      setShowResults(false);
      return;
    }

    const results = getSymptomSolutions(symptom);
    setSolutions(results);
    setShowResults(true);
  };

  const renderSolutionItem = ({ item }: { item: any }) => (
    <Card style={styles.solutionCard} mode="outlined">
      <Card.Content>
        <Text variant="titleSmall" style={styles.causeText}>Cause: {item.cause}</Text>
        <Divider style={styles.divider} />
        <Text variant="bodyMedium" style={styles.solutionText}>Solution: {item.solution}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        Symptom Checker
      </Text>
      <Text variant="bodySmall" style={styles.subtitle}>
        Enter a plant symptom to find possible causes and solutions
      </Text>

      <View style={styles.searchContainer}>
        <TextInput
          label="Enter symptom"
          value={symptom}
          onChangeText={setSymptom}
          style={styles.input}
          mode="outlined"
          right={<TextInput.Icon icon="magnify" onPress={handleSearch} />}
          onSubmitEditing={handleSearch}
        />
      </View>

      {showResults && (
        <View style={styles.resultsContainer}>
          {solutions.length > 0 ? (
            <>
              <Text variant="titleSmall" style={styles.resultsTitle}>
                Possible Solutions ({solutions.length})
              </Text>
              <FlatList
                data={solutions}
                renderItem={renderSolutionItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            </>
          ) : (
            <View style={styles.noResults}>
              <Text variant="bodyMedium">No solutions found for "{symptom}"</Text>
              <Text variant="bodySmall" style={styles.suggestion}>
                Try a more general symptom or check your plant's care guide
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  subtitle: {
    marginBottom: 16,
    color: '#666',
  },
  searchContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'white',
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultsTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 16,
  },
  solutionCard: {
    marginBottom: 8,
    backgroundColor: 'white',
  },
  causeText: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  divider: {
    marginVertical: 8,
  },
  solutionText: {
    marginTop: 4,
  },
  noResults: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  suggestion: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
  },
});
