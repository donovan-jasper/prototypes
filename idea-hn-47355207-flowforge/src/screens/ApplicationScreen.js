import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import ApplicationBuilder from '../components/ApplicationBuilder';
import DatabaseService from '../services/DatabaseService';

const ApplicationScreen = ({ route, navigation }) => {
  const [applications, setApplications] = useState([]);
  const databaseService = new DatabaseService();

  useEffect(() => {
    const loadApplications = async () => {
      await databaseService.initDatabase();
      const apps = await databaseService.getApplications();
      setApplications(apps);
    };
    loadApplications();
  }, []);

  return (
    <View style={styles.container}>
      <ApplicationBuilder navigation={navigation} databaseService={databaseService} />
      <Text style={styles.sectionTitle}>Existing Applications:</Text>
      <FlatList
        data={applications}
        renderItem={({ item }) => (
          <Text style={styles.application}>{item.name}</Text>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  application: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default ApplicationScreen;
