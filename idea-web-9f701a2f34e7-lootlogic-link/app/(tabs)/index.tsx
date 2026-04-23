import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Text, Modal, TextInput, Alert } from 'react-native';
import { useInventoryStore } from '../../lib/stores/inventoryStore';
import { useAlertStore } from '../../lib/stores/alertStore';
import InventoryCard from '../../components/InventoryCard';
import { fetchItemPrice } from '../../lib/api/priceService';
import { Ionicons } from '@expo/vector-icons';

const Dashboard = () => {
  const {
    items,
    syncFromDB,
    totalValue,
    watchlist,
    syncWatchlist,
    addToWatchlist,
    removeFromWatchlist
  } = useInventoryStore();
  const { checkRules, activeAlerts } = useAlertStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [watchlistItemId, setWatchlistItemId] = useState('');
  const [watchlistTargetPrice, setWatchlistTargetPrice] = useState('');

  useEffect(() => {
    syncFromDB();
    syncWatchlist();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([syncFromDB(), syncWatchlist()]).then(() => setRefreshing(false));
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

  const handleAddToWatchlist = async () => {
    if (!watchlistItemId || !watchlistTargetPrice) {
      Alert.alert('Error', 'Please select an item and enter a target price');
      return;
    }

    const item = items.find(i => i.id === watchlistItemId);
    if (!item) {
      Alert.alert('Error', 'Item not found');
      return;
    }

    try {
      await addToWatchlist(item.game, item.id, parseFloat(watchlistTargetPrice));
      setShowWatchlistModal(false);
      setWatchlistItemId('');
      setWatchlistTargetPrice('');
      Alert.alert('Success', 'Item added to watchlist');
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      Alert.alert('Error', 'Failed to add item to watchlist');
    }
  };

  const handleRemoveFromWatchlist = async (id: string) => {
    try {
      await removeFromWatchlist(id);
      Alert.alert('Success', 'Item removed from watchlist');
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      Alert.alert('Error', 'Failed to remove item from watchlist');
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
        renderItem={({ item }) => (
          <InventoryCard
            item={item}
            onAddToWatchlist={() => {
              setWatchlistItemId(item.id);
              setShowWatchlistModal(true);
            }}
          />
        )}
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

      {/* Watchlist Modal */}
      <Modal
        visible={showWatchlistModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWatchlistModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Watchlist</Text>

            <Text style={styles.modalLabel}>Target Price:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter target price"
              value={watchlistTargetPrice}
              onChangeText={setWatchlistTargetPrice}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowWatchlistModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddToWatchlist}
              >
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Dashboard;
