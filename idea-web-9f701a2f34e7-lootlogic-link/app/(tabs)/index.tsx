import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Text } from 'react-native';
import { useInventoryStore } from '../../lib/stores/inventoryStore';
import { useAlertStore } from '../../lib/stores/alertStore';
import InventoryCard from '../../components/InventoryCard';
import { fetchItemPrice } from '../../lib/api/priceService';
import { Ionicons } from '@expo/vector-icons';

const Dashboard = () => {
  const { items, syncFromDB, totalValue } = useInventoryStore();
  const { checkRules, activeAlerts } = useAlertStore();
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

  const handleCheckAlerts = async () => {
    setIsRefreshingPrices(true);
    try {
      await checkRules();
    } catch (error) {
      console.error('Error checking alerts:', error);
    } finally {
      setIsRefreshingPrices(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.totalValue}>Total Value: ${totalValue.toFixed(2)}</Text>
        <View style={styles.alertsContainer}>
          <Ionicons name="notifications" size={20} color="#E74C3C" />
          <Text style={styles.alertsCount}>{activeAlerts.length} active alerts</Text>
        </View>
      </View>

      <FlatList
        data={items}
        renderItem={({ item }) => <InventoryCard item={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.buttonContainer}>
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

            <TouchableOpacity
              style={[styles.refreshButton, styles.alertsButton]}
              onPress={handleCheckAlerts}
              disabled={isRefreshingPrices}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#fff"
                style={styles.refreshIcon}
              />
              <Text style={styles.refreshText}>Check Alerts</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  alertsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 20,
  },
  alertsCount: {
    marginLeft: 5,
    color: '#E74C3C',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  refreshButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginRight: 5,
  },
  alertsButton: {
    backgroundColor: '#E74C3C',
    marginLeft: 5,
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
