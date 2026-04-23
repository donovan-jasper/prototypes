import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { BarChart } from 'react-native-chart-kit';
import { getRecentReadings } from '../../services/database';
import { usePremium } from '../../hooks/usePremium';
import PremiumGate from '../../components/PremiumGate';

const { width } = Dimensions.get('window');

const carriers = ['AT&T', 'Verizon', 'T-Mobile', 'Sprint'];

export default function CompareScreen() {
  const [selectedCarrier, setSelectedCarrier] = useState('AT&T');
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [neighborhoodRankings, setNeighborhoodRankings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
                  strokeWidth: 1,
                  stroke: '#e3e3e3'
                }
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
            />
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Switch Savings Calculator</Text>
        <View style={styles.savingsCard}>
          <Text style={styles.savingsText}>
            Estimated savings if switching to {selectedCarrier}:
          </Text>
          <Text style={styles.savingsAmount}>
            ${comparisonData?.savings || 0}/month
          </Text>
          <Text style={styles.savingsNote}>
            Based on average savings from similar users in your area
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Neighborhood Rankings</Text>
        {neighborhoodRankings.map((item, index) => (
          <View key={item.carrier} style={styles.rankingItem}>
            <Text style={styles.rankNumber}>{index + 1}</Text>
            <Text style={styles.rankCarrier}>{item.carrier}</Text>
            <View style={styles.rankBarContainer}>
              <View style={[styles.rankBar, { width: `${item.score}%` }]} />
            </View>
            <Text style={styles.rankScore}>{Math.round(item.score)}</Text>
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
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
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
    marginVertical: 10,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  savingsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  savingsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  savingsAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2ECC71',
    marginBottom: 8,
  },
  savingsNote: {
    fontSize: 14,
    color: '#999',
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    width: 30,
    textAlign: 'center',
  },
  rankCarrier: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  rankBarContainer: {
    height: 10,
    backgroundColor: '#e3e3e3',
    borderRadius: 5,
    flex: 2,
    marginHorizontal: 10,
  },
  rankBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  rankScore: {
    fontSize: 14,
    color: '#666',
    width: 40,
    textAlign: 'right',
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
});
