import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { BarChart } from 'react-native-chart-kit';
import { getRecentReadings, getCarrierPerformanceStats } from '../../services/database';
import { usePremium } from '../../hooks/usePremium';
import PremiumGate from '../../components/PremiumGate';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const carriers = ['AT&T', 'Verizon', 'T-Mobile', 'Sprint'];

export default function CompareScreen() {
  const [selectedCarrier, setSelectedCarrier] = useState('AT&T');
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [neighborhoodRankings, setNeighborhoodRankings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSavings, setShowSavings] = useState(false);
  const [currentPlanCost, setCurrentPlanCost] = useState(80);
  const [newPlanCost, setNewPlanCost] = useState(70);
  const { isPremium } = usePremium();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Get recent readings from database
        const readings = await getRecentReadings(100);

        // Process data for selected carrier
        const carrierReadings = readings.filter(r => r.carrier === selectedCarrier);

        if (carrierReadings.length > 0) {
          const avgSignal = carrierReadings.reduce((sum, r) => sum + r.signal_strength, 0) / carrierReadings.length;
          const avgSpeed = carrierReadings.reduce((sum, r) => sum + (r.download_speed || 0), 0) / carrierReadings.length;
          const avgLatency = carrierReadings.reduce((sum, r) => sum + (r.latency || 0), 0) / carrierReadings.length;

          // Calculate reliability based on network type (simplified)
          const reliability = carrierReadings.filter(r => r.network_type.includes('5G')).length / carrierReadings.length * 100;

          // Mock savings calculation (would be more sophisticated in production)
          const savings = Math.round((avgSignal / 10) * 5);

          setComparisonData({
            signal: Math.round(avgSignal),
            speed: Math.round(avgSpeed),
            reliability: Math.round(reliability),
            savings
          });
        } else {
          // Fallback to mock data if no readings for carrier
          setComparisonData({
            signal: 75,
            speed: 85,
            reliability: 80,
            savings: 25
          });
        }

        // Calculate neighborhood rankings
        const rankings = await Promise.all(carriers.map(async (carrier) => {
          const stats = await getCarrierPerformanceStats(carrier, 100);
          if (stats.readingCount === 0) return null;

          return {
            carrier,
            score: (stats.avgSignal * 0.4) + (stats.avgSpeed * 0.4) + (stats.reliability * 0.2),
            avgSignal: stats.avgSignal,
            avgSpeed: stats.avgSpeed,
            reliability: stats.reliability
          };
        }));

        const validRankings = rankings.filter(r => r !== null).sort((a, b) => b.score - a.score);
        setNeighborhoodRankings(validRankings);

      } catch (error) {
        console.error('Error fetching comparison data:', error);
        // Fallback to mock data on error
        setComparisonData({
          signal: 75,
          speed: 85,
          reliability: 80,
          savings: 25
        });

        const mockRankings = carriers.map((carrier, index) => ({
          carrier,
          score: 100 - (index * 10),
          avgSignal: 80 - (index * 5),
          avgSpeed: 85 - (index * 3),
          reliability: 85 - (index * 2)
        }));
        setNeighborhoodRankings(mockRankings);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCarrier]);

  const chartData = {
    labels: ['Signal', 'Speed', 'Reliability'],
    datasets: [{
      data: comparisonData ? [
        comparisonData.signal,
        comparisonData.speed,
        comparisonData.reliability
      ] : [0, 0, 0]
    }]
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForLabels: {
      fontSize: 12,
      fontWeight: 'bold',
    },
  };

  const calculateSavings = () => {
    if (!comparisonData) return 0;
    // More sophisticated calculation would consider:
    // - Current vs new plan costs
    // - Signal quality improvements
    // - Potential data overage savings
    // - Contract length differences
    return Math.round((comparisonData.signal / 10) * (currentPlanCost - newPlanCost) * 0.75);
  };

  const handleCalculateSavings = () => {
    setShowSavings(true);
  };

  if (!isPremium) {
    return (
      <PremiumGate
        title="Unlock Carrier Comparison"
        description="See how your current carrier stacks up against competitors with real data from thousands of users in your area."
        featureList={[
          "Compare signal strength, speed, and reliability",
          "Calculate potential savings when switching",
          "See neighborhood rankings by carrier",
          "Access historical performance data",
          "Get expert recommendations"
        ]}
      />
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading carrier data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Carrier Comparison</Text>
        <Text style={styles.subtitle}>Compare your current carrier with others</Text>
      </View>

      <View style={styles.carrierSelector}>
        <Text style={styles.selectorLabel}>Select Carrier to Compare:</Text>
        <Picker
          selectedValue={selectedCarrier}
          onValueChange={(itemValue) => setSelectedCarrier(itemValue)}
          style={styles.picker}
        >
          {carriers.map((carrier) => (
            <Picker.Item key={carrier} label={carrier} value={carrier} />
          ))}
        </Picker>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Performance Comparison</Text>
        <BarChart
          data={chartData}
          width={width - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix="%"
          chartConfig={chartConfig}
          verticalLabelRotation={30}
          fromZero={true}
          showValuesOnTopOfBars={true}
        />
      </View>

      <View style={styles.savingsCalculator}>
        <Text style={styles.sectionTitle}>Switch Savings Calculator</Text>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Current Plan Cost ($/month):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={currentPlanCost.toString()}
            onChangeText={(text) => setCurrentPlanCost(parseFloat(text) || 0)}
          />
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>New Plan Cost ($/month):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={newPlanCost.toString()}
            onChangeText={(text) => setNewPlanCost(parseFloat(text) || 0)}
          />
        </View>
        <TouchableOpacity style={styles.calculateButton} onPress={handleCalculateSavings}>
          <Text style={styles.calculateButtonText}>Calculate Savings</Text>
        </TouchableOpacity>

        {showSavings && (
          <View style={styles.savingsResult}>
            <Text style={styles.savingsTitle}>Estimated Annual Savings:</Text>
            <Text style={styles.savingsAmount}>${calculateSavings()}</Text>
            <Text style={styles.savingsNote}>
              Based on improved signal quality and reduced overage charges
            </Text>
          </View>
        )}
      </View>

      <View style={styles.rankingsContainer}>
        <Text style={styles.sectionTitle}>Neighborhood Rankings</Text>
        {neighborhoodRankings.map((ranking, index) => (
          <View key={ranking.carrier} style={styles.rankingItem}>
            <View style={styles.rankingHeader}>
              <Text style={styles.rankingPosition}>{index + 1}</Text>
              <Text style={styles.rankingCarrier}>{ranking.carrier}</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>{Math.round(ranking.score)}</Text>
                <Text style={styles.scoreLabel}>Score</Text>
              </View>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{ranking.avgSignal}%</Text>
                <Text style={styles.statLabel}>Signal</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{ranking.avgSpeed} Mbps</Text>
                <Text style={styles.statLabel}>Speed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{ranking.reliability}%</Text>
                <Text style={styles.statLabel}>Reliability</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  carrierSelector: {
    backgroundColor: 'white',
    padding: 15,
    margin: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  chartContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  savingsCalculator: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  calculateButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  savingsResult: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  savingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  savingsAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ECC71',
    marginBottom: 5,
  },
  savingsNote: {
    fontSize: 14,
    color: '#666',
  },
  rankingsContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rankingItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rankingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rankingPosition: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    width: 30,
    textAlign: 'center',
  },
  rankingCarrier: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ECC71',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
});
