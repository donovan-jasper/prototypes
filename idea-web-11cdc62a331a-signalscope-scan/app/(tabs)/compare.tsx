import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { BarChart } from 'react-native-chart-kit';
import MapView, { Heatmap } from 'react-native-maps';
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
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [heatmapPoints, setHeatmapPoints] = useState([]);
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

          // Prepare heatmap points
          const points = carrierReadings.map(reading => ({
            latitude: reading.latitude,
            longitude: reading.longitude,
            weight: reading.signal_strength / 100
          }));
          setHeatmapPoints(points);
        } else {
          // Fallback to mock data if no readings for carrier
          setComparisonData({
            signal: 75,
            speed: 85,
            upload: 70,
            reliability: 80
          });
          setHeatmapPoints([]);
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
        setHeatmapPoints([]);
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
        description="See how different carriers perform in your area with real user data and calculate potential savings when switching."
        featureList={[
          "Compare signal strength, speed, and reliability",
          "See neighborhood rankings for each carrier",
          "Calculate estimated monthly savings",
          "Access historical performance data",
          "Get personalized carrier recommendations"
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
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
        >
          {heatmapPoints.length > 0 && (
            <Heatmap
              points={heatmapPoints}
              radius={20}
              opacity={0.7}
              gradient={{
                colors: ['#00FF00', '#FFFF00', '#FF0000'],
                startPoints: [0.2, 0.5, 0.8],
                colorMapSize: 256
              }}
            />
          )}
        </MapView>
        <View style={styles.mapLegend}>
          <Text style={styles.legendTitle}>Signal Strength</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#00FF00' }]} />
            <Text style={styles.legendText}>Good (80-100%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FFFF00' }]} />
            <Text style={styles.legendText}>Fair (50-79%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF0000' }]} />
            <Text style={styles.legendText}>Poor (0-49%)</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Carrier Comparison</Text>
        <View style={styles.pickerContainer}>
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
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Switch Savings Calculator</Text>
        <View style={styles.savingsCalculator}>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Current Plan Cost:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={currentPlanCost.toString()}
              onChangeText={(text) => setCurrentPlanCost(parseFloat(text) || 0)}
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>New Plan Cost:</Text>
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
              <Text style={styles.savingsTitle}>Estimated Monthly Savings:</Text>
              <Text style={styles.savingsAmount}>${calculateSavings()}</Text>
              <Text style={styles.savingsNote}>
                Based on {selectedCarrier}'s performance in your area and your plan costs.
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Neighborhood Rankings</Text>
        <View style={styles.rankingsContainer}>
          {neighborhoodRankings.map((carrier, index) => (
            <CarrierCard
              key={carrier.carrier}
              carrier={carrier.carrier}
              signal={carrier.avgSignal}
              speed={carrier.avgSpeed}
              upload={carrier.avgUpload}
              reliability={carrier.reliability}
              rank={index + 1}
            />
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
  mapContainer: {
    height: 300,
    marginBottom: 20,
  },
  map: {
    flex: 1,
  },
  mapLegend: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 5,
  },
  legendTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  legendColor: {
    width: 15,
    height: 15,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 20,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  chartContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  savingsCalculator: {
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  calculateButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  calculateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  savingsResult: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
    alignItems: 'center',
  },
  savingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  savingsAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 5,
  },
  savingsNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  rankingsContainer: {
    marginTop: 10,
  },
});
