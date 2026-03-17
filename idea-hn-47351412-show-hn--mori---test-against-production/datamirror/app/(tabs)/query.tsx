import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Provider as PaperProvider, Button, Text, Menu, Divider } from 'react-native-paper';
import QueryEditor from '../../components/QueryEditor';
import ResultsTable from '../../components/ResultsTable';
import { executeQuery } from '../../lib/database/query';
import useSnapshots from '../../lib/store/snapshots';

export default function QueryScreen() {
  const { snapshots, loadSnapshots } = useSnapshots();
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadSnapshots();
  }, []);

  useEffect(() => {
    if (snapshots.length > 0 && !selectedSnapshot) {
      setSelectedSnapshot(snapshots[0]);
    }
  }, [snapshots]);

  const handleExecute = async () => {
    if (!selectedSnapshot) {
      alert('Please select a snapshot first');
      return;
    }

    setLoading(true);
    try {
      const result = await executeQuery(selectedSnapshot.id, query);
      setResults(result);
    } catch (error) {
      console.error(error);
      alert(`Error executing query: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  return (
    <PaperProvider>
      <View style={styles.container}>
        <View style={styles.snapshotSelector}>
          <Text variant="titleMedium">Snapshot:</Text>
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <Button mode="outlined" onPress={openMenu}>
                {selectedSnapshot ? selectedSnapshot.name : 'Select Snapshot'}
              </Button>
            }
          >
            {snapshots.map((snapshot) => (
              <Menu.Item
                key={snapshot.id}
                onPress={() => {
                  setSelectedSnapshot(snapshot);
                  closeMenu();
                }}
                title={snapshot.name}
              />
            ))}
            {snapshots.length === 0 && (
              <Menu.Item
                title="No snapshots available"
                disabled
              />
            )}
          </Menu>
        </View>

        <QueryEditor value={query} onChangeText={setQuery} />

        <Button
          mode="contained"
          onPress={handleExecute}
          loading={loading}
          disabled={!selectedSnapshot}
          style={styles.button}
        >
          Execute
        </Button>

        {results && (
          <>
            <View style={styles.resultsInfo}>
              <Text>Rows: {results.rowCount}</Text>
              <Text>Duration: {results.duration}ms</Text>
            </View>
            <ResultsTable data={results.rows} />
          </>
        )}
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  snapshotSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  button: {
    marginVertical: 16,
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});
