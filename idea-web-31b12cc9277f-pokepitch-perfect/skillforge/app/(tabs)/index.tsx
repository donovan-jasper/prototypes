import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import DrillCard from '../../components/DrillCard';
import { getDrills } from '../../lib/drills';
import { Drill } from '../../lib/types';

export default function DrillLibrary() {
  const [drills, setDrills] = useState<Drill[]>([]);

  useEffect(() => {
    const loadDrills = async () => {
      const drillsData = await getDrills();
      setDrills(drillsData);
    };
    loadDrills();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={drills}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DrillCard drill={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
});
