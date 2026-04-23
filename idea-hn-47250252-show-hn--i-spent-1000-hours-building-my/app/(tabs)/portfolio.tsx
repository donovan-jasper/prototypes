import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { usePortfolio } from '../../hooks/usePortfolio';
import { Holding } from '../../lib/types';

const PortfolioScreen = () => {
  const router = useRouter();
  const { portfolio, loading, error, refreshPortfolio } = usePortfolio();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshPortfolio();
    setRefreshing(false);
  };

  const renderHolding = ({ item }: { item: Holding }) => {
    const gainLoss = item.gain || 0;
    const percentGain = item.percentGain || 0;
    const currentValue = item.currentValue || 0;

    return (
      <View style={styles.holdingItem}>
        <View style={styles.holdingHeader}>
          <Text style={styles.symbol}>{item.symbol}</Text>
          <Text style={styles.shares}>{item.shares} shares</Text>
        </View>

        <View style={styles.holdingDetails}>
          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>Cost Basis</Text>
            <Text style={styles.detailValue}>${item.costBasis.toFixed(2)}</Text>
          </View>

          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>Current Price</Text>
            <Text style={styles.detailValue}>${item.currentPrice?.toFixed(2) || 'N/A'}</Text>
          </View>

          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>Current Value</Text>
            <Text style={styles.detailValue}>${currentValue.toFixed(2)}</Text>
          </View>

          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>Gain/Loss</Text>
            <Text style={[styles.detailValue, gainLoss >= 0 ? styles.positive : styles.negative]}>
              ${Math.abs(gainLoss).toFixed(2)} ({percentGain.toFixed(2)}%)
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading portfolio...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load portfolio</Text>
        <Text style={styles.errorDetails}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Portfolio Value</Text>
        <Text style={styles.summaryValue}>${portfolio.totalValue.toFixed(2)}</Text>
        <Text style={[
          styles.summaryGain,
          portfolio.totalGain >= 0 ? styles.positive : styles.negative
        ]}>
          ${portfolio.totalGain.toFixed(2)} ({portfolio.totalPercentGain.toFixed(2)}%)
        </Text>
      </View>

      {portfolio.holdings.length > 0 ? (
        <FlatList
          data={portfolio.holdings}
          renderItem={renderHolding}
          keyExtractor={(item) => item.id?.toString() || item.symbol}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4CAF50']}
              tintColor="#4CAF50"
            />
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No holdings yet</Text>
          <Text style={styles.emptySubtext}>Tap the + button to add your first investment</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/add-holding')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryGain: {
    fontSize: 16,
    fontWeight: '500',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#d32f2f',
  },
  listContent: {
    paddingBottom: 80,
  },
  holdingItem: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  holdingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  symbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  shares: {
    fontSize: 16,
    color: '#666',
  },
  holdingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailColumn: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default PortfolioScreen;
