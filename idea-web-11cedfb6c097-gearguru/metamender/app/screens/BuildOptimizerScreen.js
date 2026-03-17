import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { optimizeBuild } from '../utils/buildOptimizer';

const BuildOptimizerScreen = () => {
  const [attack, setAttack] = useState('');
  const [defense, setDefense] = useState('');
  const [build, setBuild] = useState(null);

  const handleOptimize = () => {
    const stats = {
      attack: parseInt(attack) || 0,
      defense: parseInt(defense) || 0,
    };
    const optimizedBuild = optimizeBuild(stats);
    setBuild(optimizedBuild);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Build Optimizer</Text>
      <Text style={styles.description}>
        Enter your desired stats to generate an optimized build with recommended weapons and armor.
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Attack Stat</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter attack value"
          keyboardType="numeric"
          value={attack}
          onChangeText={setAttack}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Defense Stat</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter defense value"
          keyboardType="numeric"
          value={defense}
          onChangeText={setDefense}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleOptimize}>
        <Text style={styles.buttonText}>Optimize Build</Text>
      </TouchableOpacity>

      {build && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Recommended Weapons</Text>
          {build.weapons.map((weapon, index) => (
            <View key={index} style={styles.itemCard}>
              <Text style={styles.itemName}>{weapon.name}</Text>
              <Text style={styles.itemStat}>Attack: {weapon.attack}</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Recommended Armor</Text>
          {build.armor.map((armor, index) => (
            <View key={index} style={styles.itemCard}>
              <Text style={styles.itemName}>{armor.name}</Text>
              <Text style={styles.itemStat}>Defense: {armor.defense}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resultsContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemStat: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default BuildOptimizerScreen;
