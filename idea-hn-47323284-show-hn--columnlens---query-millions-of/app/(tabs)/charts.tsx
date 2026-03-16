import React from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useChartStore } from '../../store/charts';

const ChartsScreen = () => {
  const navigation = useNavigation();
  const { charts, deleteChart } = useChartStore();

  const handleChartPress = (id) => {
    navigation.navigate('Chart', { id });
  };

  const handleDelete = (id) => {
    deleteChart(id);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={charts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.chartItem}>
            <Text>{item.name}</Text>
            <Button title="Open" onPress={() => handleChartPress(item.id)} />
            <Button title="Delete" onPress={() => handleDelete(item.id)} />
          </View>
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
  chartItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default ChartsScreen;
