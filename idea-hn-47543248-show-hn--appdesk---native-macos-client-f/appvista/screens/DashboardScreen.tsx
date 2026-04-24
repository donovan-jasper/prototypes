import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { fetchAnalytics } from '../services/analytics';

const DashboardScreen = ({ navigation }) => {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    const loadApps = async () => {
      const appIds = ['com.example.app1', 'com.example.app2']; // Replace with actual app IDs
      const appsData = await Promise.all(appIds.map(id => fetchAnalytics(id)));
      setApps(appsData);
    };

    loadApps();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={apps}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.appCard}
            onPress={() => navigation.navigate('Analytics', { appId: item.id })}
          >
            <Text style={styles.appName}>{item.name}</Text>
            <Text>Sales: {item.sales}</Text>
            <Text>Ratings: {item.ratings}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  appCard: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
