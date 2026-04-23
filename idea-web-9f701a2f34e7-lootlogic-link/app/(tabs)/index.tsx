import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Text } from 'react-native';
import { useInventoryStore } from '../../lib/stores/inventoryStore';
import { useAlertStore } from '../../lib/stores/alertStore';
import InventoryCard from '../../components/InventoryCard';
import { fetchItemPrice } from '../../lib/api/priceService';
import { Ionicons } from '@expo/vector-icons';

const Dashboard = () => {
  const { items, syncFromDB } = useInventoryStore();
  const { checkRules } = useAlertStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);

  useEffect(() => {
    syncFromDB();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    syncFromDB().then(() => setRefreshing(false));
  }, []);

  const handleRefreshPrices = async () => {
    setIsRefreshingPrices(true);

    try {
      // Create a map of current prices
      const currentPrices: Record<string, number> = {};

      // Fetch prices for all items
      await Promise.all(
        items.map(async (item) => {
          try {
            const price = await fetchItemPrice(item.game, item.id);
            currentPrices[`${item.game}-${item.name}`] = price;
          } catch (error) {
            console.error(`Error fetching price for ${item.name}:`, error);
          }
        })
      );

      // Check alert rules with current prices
      await checkRules(currentPrices);

      // Refresh the UI
      syncFromDB();
    } catch (error) {
      console.error('Error refreshing prices:', error);
    } finally {
      setIsRefreshingPrices(false);
    }
  };

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
        ListHeaderComponent={
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefreshPrices}
            disabled={isRefreshingPrices}
          >
            <Ionicons
              name={isRefreshingPrices ? "reload-circle" : "refresh"}
              size={20}
              color="#fff"
              style={styles.refreshIcon}
            />
            <Text style={styles.refreshText}>
              {isRefreshingPrices ? "Refreshing..." : "Refresh Prices"}
            </Text>
          </TouchableOpacity>
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
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  refreshText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  refreshIcon: {
    marginRight: 5,
  },
});

export default Dashboard;
