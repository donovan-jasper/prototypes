import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useInventoryStore } from '../../lib/stores/inventoryStore';
import InventoryCard from '../../components/InventoryCard';

const Dashboard = () => {
  const { items, syncFromDB } = useInventoryStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    syncFromDB();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    syncFromDB().then(() => setRefreshing(false));
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={({ item }) => <InventoryCard item={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});

export default Dashboard;
