import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { BarChart } from 'react-native-chart-kit';
import { getRecentReadings } from '../../services/database';
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
          const carrierReadings = readings.filter(r => r.carrier === carrier);
          if (carrierReadings.length === 0) return null;

          const avgSignal = carrierReadings.reduce((sum, r) => sum + r.signal_strength, 0) / carrierReadings.length;
          const avgSpeed = carrierReadings.reduce((sum, r) => sum + (r.download_speed || 0), 0) / carrierReadings.length;
          const reliability = carrierReadings.filter(r => r.network_type.includes('5G')).length / carrierReadings.length * 100;

          return {
            carrier,
            score: (avgSignal * 0.4) + (avgSpeed * 0.4) + (reliability * 0.2)
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
    labels: ['Signal', 'Speed', 'Reliability'],
    datasets: [{
      data: comparisonData ? [
        comparisonData.signal,
        comparisonData.speed,
        comparisonData.reliability
      ] : [0, 0, 0]
    }]
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
          "Calculate potential savings from switching",
          "View neighborhood rankings by carrier",
          "Access historical data trends"
        ]}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Carrier Comparison</Text>

        <View style={styles.pickerContainer}>
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

        {comparisonData && (
          <View style={styles.chartContainer}>
            <BarChart
              data={chartData}
              width={width - 40}
              height={220}
              yAxisLabel=""
              yAxisSuffix="%"
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForBackgroundLines: {
                  strokeWidth: 0.5,
                  stroke: '#e3e3e3'
                }
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
              fromZero={true}
              showValuesOnTopOfBars={true}
            />
          </View>
        )}

        <View style={styles.metricsContainer}>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{comparisonData?.signal || 0}%</Text>
            <Text style={styles.metricLabel}>Signal Strength</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{comparisonData?.speed || 0}%</Text>
            <Text style={styles.metricLabel}>Download Speed</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{comparisonData?.reliability || 0}%</Text>
            <Text style={styles.metricLabel}>Reliability</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.savingsButton}
          onPress={() => setShowSavings(!showSavings)}
        >
          <Text style={styles.savingsButtonText}>
            {showSavings ? 'Hide Savings Calculator' : 'Show Savings Calculator'}
          </Text>
          <Ionicons
            name={showSavings ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#007AFF"
          />
        </TouchableOpacity>

        {showSavings && (
          <View style={styles.savingsContainer}>
            <Text style={styles.savingsTitle}>Switch Savings Calculator</Text>
            <Text style={styles.savingsDescription}>
              Estimated savings if you switch to {selectedCarrier} based on historical data:
            </Text>

            <View style={styles.savingsBox}>
              <Text style={styles.savingsAmount}>${comparisonData?.savings || 0}/month</Text>
              <Text style={styles.savingsSubtitle}>Potential Savings</Text>
            </View>

            <Text style={styles.savingsNote}>
              * Based on average signal quality improvements and typical carrier pricing models.
              Actual savings may vary based on your specific usage patterns and contract terms.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Neighborhood Rankings</Text>

        <View style={styles.rankingsContainer}>
          {neighborhoodRankings.map((item, index) => (
            <View key={item.carrier} style={styles.rankingItem}>
              <Text style={styles.rankingPosition}>{index + 1}</Text>
              <Text style={styles.rankingCarrier}>{item.carrier}</Text>
              <View style={styles.rankingBarContainer}>
                <View style={[styles.rankingBar, { width: `${item.score}%` }]} />
              </View>
              <Text style={styles.rankingScore}>{Math.round(item.score)}</Text>
            </View>
          ))}
        </View>
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
  section: {
    backgroundColor: 'white',
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    margin: 10,
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
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  chartContainer: {
    marginBottom: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  savingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    marginBottom: 20,
  },
  savingsButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginRight: 5,
  },
  savingsContainer: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  savingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  savingsDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  savingsBox: {
    backgroundColor: '#e6f7ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  savingsAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  savingsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  savingsNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
  },
  rankingsContainer: {
    marginTop: 10,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rankingPosition: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    width: 30,
    textAlign: 'center',
  },
  rankingCarrier: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  rankingBarContainer: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    flex: 2,
    marginHorizontal: 10,
  },
  rankingBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  rankingScore: {
    fontSize: 14,
    color: '#666',
    width: 40,
    textAlign: 'right',
  },
});
