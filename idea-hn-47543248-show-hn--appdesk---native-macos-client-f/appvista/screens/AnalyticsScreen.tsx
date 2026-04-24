import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VictoryChart, VictoryLine } from 'victory-native';
import { fetchAnalytics } from '../services/analytics';

const AnalyticsScreen = ({ route }) => {
  const { appId } = route.params;
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      const analyticsData = await fetchAnalytics(appId);
      setAnalytics(analyticsData);
    };

    loadAnalytics();
  }, [appId]);

  if (!analytics) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>{analytics.name}</Text>
      <VictoryChart>
        <VictoryLine
          data={analytics.salesData}
          x="date"
          y="sales"
        />
      </VictoryChart>
      <Text>Average Rating: {analytics.ratings}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default AnalyticsScreen;
