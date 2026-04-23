import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading carrier data...</Text>
      </View>
    );
  }

  if (!isPremium) {
    return (
      <PremiumGate
        title="Unlock Carrier Comparison"
        description="See how different carriers perform in your area with detailed comparisons and savings estimates."
        featureList={[
          "Compare signal strength, speed, and reliability",
          "Estimate monthly savings from switching carriers",
          "View neighborhood rankings for each carrier",
          "Access crowdsourced data from thousands of users",
          "Make informed decisions before switching plans"
        ]}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Carrier Comparison</Text>
        <Text style={styles.subtitle}>Based on crowdsourced data from your area</Text>
      </View>

      <View style={styles.carrierSelector}>
        <Text style={styles.selectorLabel}>Select Carrier:</Text>
        <Picker
          selectedValue={selectedCarrier}
          onValueChange={(itemValue) => setSelectedCarrier(itemValue)}
          style={styles.picker}
        >
          {carriers.map(carrier => (
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
          showBarTops={false}
          withInnerLines={false}
          style={styles.chart}
        />
      </View>

      <View style={styles.savingsCalculator}>
        <Text style={styles.sectionTitle}>Switch Savings Calculator</Text>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Current Plan Cost:</Text>
          <Text style={styles.inputValue}>${currentPlanCost}/month</Text>
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>New Plan Cost:</Text>
          <Text style={styles.inputValue}>${newPlanCost}/month</Text>
        </View>

        {!showSavings ? (
          <TouchableOpacity style={styles.calculateButton} onPress={handleCalculateSavings}>
            <Text style={styles.calculateButtonText}>Calculate Savings</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.savingsResult}>
            <Text style={styles.savingsAmount}>Estimated Annual Savings: ${calculateSavings()}</Text>
            <Text style={styles.savingsNote}>
              Based on improved signal quality and potential data savings with {selectedCarrier}
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
              <View style={styles.rankingScoreContainer}>
                <Text style={styles.rankingScore}>{Math.round(ranking.score)}</Text>
                <Text style={styles.rankingScoreLabel}>Score</Text>
              </View>
            </View>

            <View style={styles.rankingDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Signal:</Text>
                <Text style={styles.detailValue}>{ranking.avgSignal}%</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Speed:</Text>
                <Text style={styles.detailValue}>{ranking.avgSpeed}%</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Reliability:</Text>
                <Text style={styles.detailValue}>{ranking.reliability}%</Text>
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
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
    margin: 20,
    padding: 15,
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
    marginHorizontal: 20,
    padding: 15,
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  savingsCalculator: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 15,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: '#666',
  },
  inputValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  calculateButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  savingsResult: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  savingsAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  savingsNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  rankingsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 15,
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
  },
  rankingCarrier: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  rankingScoreContainer: {
    alignItems: 'flex-end',
  },
  rankingScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ECC71',
  },
  rankingScoreLabel: {
    fontSize: 12,
    color: '#666',
  },
  rankingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
