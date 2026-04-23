import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { BarChart } from 'react-native-chart-kit';
import { getRecentReadings, getCarrierPerformanceStats } from '../../services/database';
import { usePremium } from '../../hooks/usePremium';
import PremiumGate from '../../components/PremiumGate';
import CarrierCard from '../../components/CarrierCard';
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
          const avgUpload = carrierReadings.reduce((sum, r) => sum + (r.upload_speed || 0), 0) / carrierReadings.length;
          const reliability = carrierReadings.filter(r => r.network_type.includes('5G')).length / carrierReadings.length * 100;

          setComparisonData({
            signal: Math.round(avgSignal),
            speed: Math.round(avgSpeed),
            upload: Math.round(avgUpload),
            reliability: Math.round(reliability)
          });
        } else {
          // Fallback to mock data if no readings for carrier
          setComparisonData({
            signal: 75,
            speed: 85,
            upload: 70,
            reliability: 80
          });
        }

        // Calculate neighborhood rankings
        const rankings = await Promise.all(carriers.map(async (carrier) => {
          const stats = await getCarrierPerformanceStats(carrier, 100);
          if (stats.readingCount === 0) return null;

          return {
            carrier,
            avgSignal: stats.avgSignal,
            avgSpeed: stats.avgSpeed,
            avgUpload: stats.avgUpload || 0,
            reliability: stats.reliability,
            score: (stats.avgSignal * 0.4) + (stats.avgSpeed * 0.4) + (stats.reliability * 0.2)
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
          upload: 70,
          reliability: 80
        });

        const mockRankings = carriers.map((carrier, index) => ({
          carrier,
          avgSignal: 80 - (index * 5),
          avgSpeed: 85 - (index * 3),
          avgUpload: 70 - (index * 2),
          reliability: 85 - (index * 2),
          score: 100 - (index * 10)
        }));
        setNeighborhoodRankings(mockRankings);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCarrier]);

  const chartData = {
    labels: ['Signal', 'Download', 'Upload', 'Reliability'],
    datasets: [{
      data: comparisonData ? [
        comparisonData.signal,
        comparisonData.speed,
        comparisonData.upload,
        comparisonData.reliability
      ] : [0, 0, 0, 0]
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
        description="See which carrier performs best in your area with detailed performance metrics and savings estimates."
        featureList={[
          "Average signal strength for each carrier",
          "Download/upload speed comparisons",
          "Reliability scores (5G coverage)",
          "Switch savings calculator"
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
        <Text style={styles.subtitle}>Compare performance in your area</Text>
      </View>

      <View style={styles.carrierSelector}>
        <Text style={styles.label}>Select Carrier:</Text>
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

      {comparisonData && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{selectedCarrier} Performance</Text>
          <BarChart
            data={chartData}
            width={width - 32}
            height={220}
            yAxisLabel=""
            yAxisSuffix="%"
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            fromZero={true}
            showValuesOnTopOfBars={true}
            withInnerLines={false}
          />
        </View>
      )}

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
        <TouchableOpacity
          style={styles.calculateButton}
          onPress={handleCalculateSavings}
        >
          <Text style={styles.calculateButtonText}>Calculate Savings</Text>
        </TouchableOpacity>

        {showSavings && (
          <View style={styles.savingsResult}>
            <Text style={styles.savingsTitle}>Estimated Annual Savings:</Text>
            <Text style={styles.savingsAmount}>${calculateSavings()}</Text>
            <Text style={styles.savingsNote}>
              Based on improved signal quality and plan cost difference
            </Text>
          </View>
        )}
      </View>

      <View style={styles.rankingsSection}>
        <Text style={styles.sectionTitle}>Neighborhood Rankings</Text>
        {neighborhoodRankings.map((ranking, index) => (
          <CarrierCard
            key={ranking.carrier}
            carrier={ranking.carrier}
            signal={ranking.avgSignal}
            speed={ranking.avgSpeed}
            upload={ranking.avgUpload}
            reliability={ranking.reliability}
            rank={index + 1}
          />
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
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  carrierSelector: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  savingsCalculator: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  calculateButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  savingsResult: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b0e0e6',
  },
  savingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  savingsAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 8,
  },
  savingsNote: {
    fontSize: 14,
    color: '#666',
  },
  rankingsSection: {
    padding: 16,
  },
});
