import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Button, Text } from 'react-native-paper';

const BudgetOptimizer = ({ onClose }) => {
  const [budget, setBudget] = useState('');
  const [optimizedBuild, setOptimizedBuild] = useState(null);

  const handleOptimize = () => {
    // Logic to optimize budget
    const budgetValue = parseFloat(budget);
    if (isNaN(budgetValue)) {
      alert('Please enter a valid budget');
      return;
    }
    // Mock optimization result
    setOptimizedBuild({
      speakers: { name: 'Speaker A', price: budgetValue * 0.4 },
      amp: { name: 'Amp B', price: budgetValue * 0.3 },
      source: { name: 'Source C', price: budgetValue * 0.2 },
      accessories: { name: 'Accessories D', price: budgetValue * 0.1 },
    });
  };

  return (
    <View style={styles.container}>
      <Text>Enter your total budget:</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 1000"
        keyboardType="numeric"
        value={budget}
        onChangeText={setBudget}
      />
      <Button mode="contained" onPress={handleOptimize} style={styles.button}>
        Optimize
      </Button>
      {optimizedBuild && (
        <View style={styles.result}>
          <Text>Optimized Build:</Text>
          <Text>Speakers: {optimizedBuild.speakers.name} - ${optimizedBuild.speakers.price.toFixed(2)}</Text>
          <Text>Amp: {optimizedBuild.amp.name} - ${optimizedBuild.amp.price.toFixed(2)}</Text>
          <Text>Source: {optimizedBuild.source.name} - ${optimizedBuild.source.price.toFixed(2)}</Text>
          <Text>Accessories: {optimizedBuild.accessories.name} - ${optimizedBuild.accessories.price.toFixed(2)}</Text>
        </View>
      )}
      <Button mode="contained" onPress={onClose} style={styles.button}>
        Close
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  button: {
    marginTop: 16,
  },
  result: {
    marginTop: 16,
  },
});

export default BudgetOptimizer;
