import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import BuildCanvas from '@/components/BuildCanvas';
import BudgetOptimizer from '@/components/BudgetOptimizer';
import * as SQLite from 'expo-sqlite';
import { Build } from '@/lib/types';

const BuildDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const [build, setBuild] = useState<Build | null>(null);
  const [showOptimizer, setShowOptimizer] = useState(false);

  useEffect(() => {
    const loadBuild = async () => {
      if (id === 'new') {
        setBuild({ id: 0, name: 'New Build', created_at: new Date().toISOString(), components: [] });
      } else {
        const db = await SQLite.openDatabaseAsync('audiochain.db');
        const result = await db.getFirstAsync('SELECT * FROM builds WHERE id = ?', [id]);
        if (result) {
          setBuild(result as Build);
        }
      }
    };
    loadBuild();
  }, [id]);

  const handleSaveBuild = async () => {
    if (!build) return;
    
    const db = await SQLite.openDatabaseAsync('audiochain.db');
    if (id === 'new') {
      const result = await db.runAsync(
        'INSERT INTO builds (name, created_at) VALUES (?, ?)',
        ['New Build', new Date().toISOString()]
      );
      setBuild({ ...build, id: result.lastInsertRowId });
    } else {
      await db.runAsync(
        'UPDATE builds SET name = ? WHERE id = ?',
        [build.name, id]
      );
    }
  };

  if (!build) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BuildCanvas build={build} />
      <Button mode="contained" onPress={handleSaveBuild} style={styles.button}>
        Save Build
      </Button>
      <Button mode="contained" onPress={() => setShowOptimizer(true)} style={styles.button}>
        Optimize Budget
      </Button>
      {showOptimizer && <BudgetOptimizer onClose={() => setShowOptimizer(false)} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  button: {
    marginTop: 16,
  },
});

export default BuildDetailScreen;
