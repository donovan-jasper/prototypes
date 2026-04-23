import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { optimizeBuild } from '../utils/buildOptimizer';

const BuildOptimizerScreen = () => {
  const [attack, setAttack] = useState('');
  const [defense, setDefense] = useState('');
  const [build, setBuild] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOptimize = () => {
    setIsLoading(true);
    const stats = {
      attack: parseInt(attack) || 0,
      defense: parseInt(defense) || 0,
    };

    // Simulate API call delay
    setTimeout(() => {
      const optimizedBuild = optimizeBuild(stats);
      setBuild(optimizedBuild);
      setIsLoading(false);
    }, 800);
  };

  const handleSaveBuild = () => {
    // Implement save functionality
    alert('Build saved successfully!');
  };

  const handleShareBuild = () => {
    // Implement share functionality
    alert('Build shared with community!');
  };

  const renderEffectivenessBar = (percentage) => {
    const color = percentage >= 80 ? '#34C759' : percentage >= 50 ? '#FF9500' : '#FF3B30';
    return (
      <View style={styles.effectivenessBarContainer}>
        <View style={[styles.effectivenessBar, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{item.score.toFixed(0)}</Text>
        </View>
      </View>
      <Text style={styles.itemGame}>{item.game}</Text>
      <View style={styles.itemStats}>
        <Text style={styles.itemStat}>Attack: {item.attack}</Text>
        <Text style={styles.itemType}>{item.type}</Text>
      </View>
      {item.special && (
        <View style={styles.specialContainer}>
          <Text style={styles.specialLabel}>Special:</Text>
          <Text style={styles.specialText}>{item.special}</Text>
        </View>
      )}
      <View style={styles.rarityContainer}>
        <Text style={[styles.rarityText, { color: getRarityColor(item.rarity) }]}>{item.rarity}</Text>
      </View>
    </View>
  );

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Legendary': return '#FFD700';
      case 'Exotic': return '#9370DB';
      case 'Mythic': return '#FF4500';
      case 'Rare': return '#1E90FF';
      default: return '#A9A9A9';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
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

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleOptimize}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Optimizing...' : 'Optimize Build'}
        </Text>
      </TouchableOpacity>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Analyzing game data...</Text>
        </View>
      )}

      {build && !isLoading && (
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
                {build.overallEffectiveness.toFixed(0)}%
              </Text>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Recommended Weapons</Text>
            <FlatList
              data={build.weapons}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Recommended Armor</Text>
            <FlatList
              data={build.armor}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>

          <View style={styles.comparisonSection}>
            <Text style={styles.sectionTitle}>Meta Comparison</Text>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Your Build</Text>
              <Text style={styles.comparisonValue}>{build.overallEffectiveness.toFixed(0)}%</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Meta Average</Text>
              <Text style={styles.comparisonValue}>85%</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Difference</Text>
              <Text style={[
                styles.comparisonValue,
                { color: build.overallEffectiveness >= 85 ? '#34C759' : '#FF3B30' }
              ]}>
                {build.overallEffectiveness >= 85 ? '+' : ''}{(build.overallEffectiveness - 85).toFixed(0)}%
              </Text>
            </View>
          </View>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleSaveBuild}>
              <Text style={styles.actionButtonText}>Save Build</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.shareButton]} onPress={handleShareBuild}>
              <Text style={[styles.actionButtonText, styles.shareButtonText]}>Share with Community</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultsContainer: {
    marginTop: 20,
  },
  statsComparisonCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  effectivenessBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginVertical: 5,
    overflow: 'hidden',
  },
  effectivenessBar: {
    height: '100%',
    borderRadius: 4,
  },
  effectivenessText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    marginBottom: 10,
  },
  overallContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  overallLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  overallValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  horizontalList: {
    paddingVertical: 10,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginRight: 15,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  scoreBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  scoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  itemGame: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  itemStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  itemStat: {
    fontSize: 14,
    color: '#333',
  },
  itemType: {
    fontSize: 14,
    color: '#666',
  },
  specialContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  specialLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  specialText: {
    fontSize: 14,
    color: '#666',
  },
  rarityContainer: {
    marginTop: 10,
  },
  rarityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  comparisonSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  comparisonLabel: {
    fontSize: 16,
    color: '#666',
  },
  comparisonValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  shareButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButtonText: {
    color: '#fff',
  },
});

export default BuildOptimizerScreen;
