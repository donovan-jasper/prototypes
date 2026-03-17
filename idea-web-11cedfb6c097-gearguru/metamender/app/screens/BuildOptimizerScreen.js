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

  const renderEffectivenessBar = (percentage) => {
    const color = percentage >= 80 ? '#34C759' : percentage >= 50 ? '#FF9500' : '#FF3B30';
    return (
      <View style={styles.effectivenessBarContainer}>
        <View style={[styles.effectivenessBar, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    );
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
          placeholder="Enter attack value (e.g., 300)"
          keyboardType="numeric"
          value={attack}
          onChangeText={setAttack}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Defense Stat</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter defense value (e.g., 250)"
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
          <View style={styles.statsComparisonCard}>
            <Text style={styles.comparisonTitle}>Build Effectiveness</Text>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Attack</Text>
              <Text style={styles.statValue}>
                {build.totalStats.attack} / {build.targetStats.attack}
              </Text>
            </View>
            {renderEffectivenessBar(build.effectiveness.attack)}
            <Text style={styles.effectivenessText}>
              {build.effectiveness.attack.toFixed(0)}% of target
            </Text>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Defense</Text>
              <Text style={styles.statValue}>
                {build.totalStats.defense} / {build.targetStats.defense}
              </Text>
            </View>
            {renderEffectivenessBar(build.effectiveness.defense)}
            <Text style={styles.effectivenessText}>
              {build.effectiveness.defense.toFixed(0)}% of target
            </Text>

            <View style={styles.overallContainer}>
              <Text style={styles.overallLabel}>Overall Optimization</Text>
              <Text style={styles.overallValue}>
                {build.effectiveness.overall.toFixed(1)}%
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Recommended Weapons</Text>
          {build.weapons.map((weapon, index) => (
            <View key={weapon.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{weapon.name}</Text>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>{weapon.score.toFixed(0)}</Text>
                </View>
              </View>
              <Text style={styles.itemGame}>{weapon.game}</Text>
              <View style={styles.itemStats}>
                <Text style={styles.itemStat}>Attack: {weapon.attack}</Text>
                <Text style={styles.itemType}>{weapon.type}</Text>
              </View>
              {weapon.special && (
                <View style={styles.specialContainer}>
                  <Text style={styles.specialLabel}>Special:</Text>
                  <Text style={styles.specialText}>{weapon.special}</Text>
                </View>
              )}
            </View>
          ))}

          <Text style={styles.sectionTitle}>Recommended Armor</Text>
          {build.armor.map((armor, index) => (
            <View key={armor.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{armor.name}</Text>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>{armor.score.toFixed(0)}</Text>
                </View>
              </View>
              <Text style={styles.itemGame}>{armor.game}</Text>
              <View style={styles.itemStats}>
                <Text style={styles.itemStat}>Defense: {armor.defense}</Text>
                <Text style={styles.itemType}>{armor.type}</Text>
              </View>
              {armor.special && (
                <View style={styles.specialContainer}>
                  <Text style={styles.specialLabel}>Special:</Text>
                  <Text style={styles.specialText}>{armor.special}</Text>
                </View>
              )}
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
    paddingBottom: 40,
  },
  statsComparisonCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  effectivenessBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  effectivenessBar: {
    height: '100%',
    borderRadius: 4,
  },
  effectivenessText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  overallContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overallLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  overallValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  scoreBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  itemGame: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemStat: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemType: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  specialContainer: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  specialLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  specialText: {
    fontSize: 14,
    color: '#333',
  },
});

export default BuildOptimizerScreen;
