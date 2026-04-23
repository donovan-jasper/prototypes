import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { usePortfolio } from '../../hooks/usePortfolio';
import { Holding } from '../../lib/types';
import { useColorScheme } from 'react-native';

const PortfolioScreen = () => {
  const router = useRouter();
  const { portfolio, loading, error, refreshPortfolio, priceService } = usePortfolio();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const colorScheme = useColorScheme();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshPortfolio();
    } catch (err) {
      Alert.alert('Error', 'Failed to refresh portfolio. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCurrencyChange = async (currency: string) => {
    if (currency === selectedCurrency) return;

    try {
      setSelectedCurrency(currency);
      // Refresh portfolio with new currency
      await refreshPortfolio(currency);
    } catch (err) {
      Alert.alert('Error', 'Failed to change currency. Please try again.');
      setSelectedCurrency('USD'); // Fallback to USD
    }
  };

  const renderHolding = ({ item }: { item: Holding }) => {
    const gainLoss = item.gain || 0;
    const percentGain = item.percentGain || 0;
    const currentValue = item.currentValue || 0;

    return (
      <View style={[
        styles.holdingItem,
        { backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF' }
      ]}>
        <View style={styles.holdingHeader}>
          <Text style={[
            styles.symbol,
            { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }
          ]}>{item.symbol}</Text>
          <Text style={[
            styles.shares,
            { color: colorScheme === 'dark' ? '#AAAAAA' : '#666666' }
          ]}>{item.shares} shares</Text>
        </View>

        <View style={styles.holdingDetails}>
          <View style={styles.detailColumn}>
            <Text style={[
              styles.detailLabel,
              { color: colorScheme === 'dark' ? '#AAAAAA' : '#666666' }
            ]}>Cost Basis</Text>
            <Text style={[
              styles.detailValue,
              { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }
            ]}>{item.currency || 'USD'} {item.costBasis.toFixed(2)}</Text>
          </View>

          <View style={styles.detailColumn}>
            <Text style={[
              styles.detailLabel,
              { color: colorScheme === 'dark' ? '#AAAAAA' : '#666666' }
            ]}>Current Price</Text>
            <Text style={[
              styles.detailValue,
              { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }
            ]}>{item.currency || 'USD'} {item.currentPrice?.toFixed(2) || 'N/A'}</Text>
          </View>

          <View style={styles.detailColumn}>
            <Text style={[
              styles.detailLabel,
              { color: colorScheme === 'dark' ? '#AAAAAA' : '#666666' }
            ]}>Current Value</Text>
            <Text style={[
              styles.detailValue,
              { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }
            ]}>{item.currency || 'USD'} {currentValue.toFixed(2)}</Text>
          </View>

          <View style={styles.detailColumn}>
            <Text style={[
              styles.detailLabel,
              { color: colorScheme === 'dark' ? '#AAAAAA' : '#666666' }
            ]}>Gain/Loss</Text>
            <Text style={[
              styles.detailValue,
              gainLoss >= 0 ? styles.positive : styles.negative,
              { color: gainLoss >= 0 ? (colorScheme === 'dark' ? '#4CAF50' : '#4CAF50') : (colorScheme === 'dark' ? '#F44336' : '#F44336') }
            ]}>
              {item.currency || 'USD'} {Math.abs(gainLoss).toFixed(2)} ({percentGain.toFixed(2)}%)
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[
        styles.loadingContainer,
        { backgroundColor: colorScheme === 'dark' ? '#121212' : '#f5f5f5' }
      ]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={[
          styles.loadingText,
          { color: colorScheme === 'dark' ? '#AAAAAA' : '#666' }
        ]}>Loading portfolio...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[
        styles.errorContainer,
        { backgroundColor: colorScheme === 'dark' ? '#121212' : '#f5f5f5' }
      ]}>
        <Text style={[
          styles.errorText,
          { color: colorScheme === 'dark' ? '#F44336' : '#d32f2f' }
        ]}>Failed to load portfolio</Text>
        <Text style={[
          styles.errorDetails,
          { color: colorScheme === 'dark' ? '#AAAAAA' : '#666' }
        ]}>{error.message}</Text>
        <TouchableOpacity
          style={[
            styles.retryButton,
            { backgroundColor: colorScheme === 'dark' ? '#4CAF50' : '#4CAF50' }
          ]}
          onPress={onRefresh}
        >
          <Text style={[
            styles.retryButtonText,
            { color: colorScheme === 'dark' ? '#FFFFFF' : '#FFFFFF' }
          ]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      { backgroundColor: colorScheme === 'dark' ? '#121212' : '#f5f5f5' }
    ]}>
      <View style={[
        styles.summaryContainer,
        { backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF' }
      ]}>
        <View style={styles.currencySelector}>
          <TouchableOpacity
            style={[
              styles.currencyButton,
              selectedCurrency === 'USD' && styles.selectedCurrencyButton
            ]}
            onPress={() => handleCurrencyChange('USD')}
          >
            <Text style={[
              styles.currencyButtonText,
              selectedCurrency === 'USD' && styles.selectedCurrencyButtonText
            ]}>USD</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.currencyButton,
              selectedCurrency === 'EUR' && styles.selectedCurrencyButton
            ]}
            onPress={() => handleCurrencyChange('EUR')}
          >
            <Text style={[
              styles.currencyButtonText,
              selectedCurrency === 'EUR' && styles.selectedCurrencyButtonText
            ]}>EUR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.currencyButton,
              selectedCurrency === 'GBP' && styles.selectedCurrencyButton
            ]}
            onPress={() => handleCurrencyChange('GBP')}
          >
            <Text style={[
              styles.currencyButtonText,
              selectedCurrency === 'GBP' && styles.selectedCurrencyButtonText
            ]}>GBP</Text>
          </TouchableOpacity>
        </View>

        <Text style={[
          styles.summaryTitle,
          { color: colorScheme === 'dark' ? '#AAAAAA' : '#666666' }
        ]}>Portfolio Value</Text>
        <Text style={[
          styles.summaryValue,
          { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }
        ]}>{selectedCurrency} {portfolio.totalValue.toFixed(2)}</Text>
        <Text style={[
          styles.summaryGain,
          portfolio.totalGain >= 0 ? styles.positive : styles.negative,
          { color: portfolio.totalGain >= 0 ? (colorScheme === 'dark' ? '#4CAF50' : '#4CAF50') : (colorScheme === 'dark' ? '#F44336' : '#F44336') }
        ]}>
          {selectedCurrency} {portfolio.totalGain.toFixed(2)} ({portfolio.totalPercentGain.toFixed(2)}%)
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
          <Text style={[
            styles.emptyText,
            { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }
          ]}>No holdings yet</Text>
          <Text style={[
            styles.emptySubtext,
            { color: colorScheme === 'dark' ? '#AAAAAA' : '#666666' }
          ]}>Tap the + button to add your first investment</Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.addButton,
          { backgroundColor: colorScheme === 'dark' ? '#4CAF50' : '#4CAF50' }
        ]}
        onPress={() => router.push('/add-holding')}
      >
        <Text style={[
          styles.addButtonText,
          { color: colorScheme === 'dark' ? '#FFFFFF' : '#FFFFFF' }
        ]}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
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
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  summaryContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 10,
  },
  currencySelector: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  currencyButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 5,
    borderRadius: 5,
  },
  selectedCurrencyButton: {
    backgroundColor: '#4CAF50',
  },
  currencyButtonText: {
    color: '#666666',
  },
  selectedCurrencyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  summaryTitle: {
    fontSize: 16,
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  summaryGain: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  listContent: {
    paddingBottom: 20,
  },
  holdingItem: {
    marginHorizontal: 10,
    marginBottom: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  },
  shares: {
    fontSize: 14,
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
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
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
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default PortfolioScreen;
