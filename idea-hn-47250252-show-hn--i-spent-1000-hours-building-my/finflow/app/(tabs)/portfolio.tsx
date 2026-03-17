import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { usePortfolio } from '../../hooks/usePortfolio';
import PortfolioSummary from '../../components/PortfolioSummary';
import { FloatingAction } from 'react-native-floating-action';
import { useNavigation } from '@react-navigation/native';
import { Holding } from '../../lib/types';

const PortfolioScreen = () => {
  const navigation = useNavigation();
  const { portfolio, loading } = usePortfolio();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const renderHoldingItem = ({ item }: { item: Holding }) => (
    <TouchableOpacity
      style={styles.holdingItem}
      onPress={() => navigation.navigate('holding-detail', { holdingId: item.id })}
    >
      <View style={styles.holdingInfo}>
        <Text style={styles.holdingSymbol}>{item.symbol}</Text>
        <Text style={styles.holdingShares}>{item.shares} shares</Text>
      </View>
      <View style={styles.holdingValues}>
        <Text style={styles.holdingValue}>${item.currentValue.toFixed(2)}</Text>
        <Text style={[styles.holdingGain, item.gain >= 0 ? styles.positive : styles.negative]}>
          {item.gain >= 0 ? '+' : ''}${item.gain.toFixed(2)} ({item.percentGain.toFixed(2)}%)
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <PortfolioSummary portfolio={portfolio} />
      <FlatList
        data={portfolio.holdings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderHoldingItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No holdings yet — tap + to add one</Text>
          </View>
        }
      />
      <FloatingAction
        actions={[
          {
            text: 'Add Holding',
            icon: require('../../assets/images/add.png'),
            name: 'add_holding',
            position: 1,
          },
        ]}
        onPressItem={(name) => {
          if (name === 'add_holding') {
            navigation.navigate('add-holding');
          }
        }}
        color="#007AFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  holdingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  holdingInfo: {
    flex: 1,
  },
  holdingValues: {
    alignItems: 'flex-end',
  },
  holdingSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  holdingShares: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  holdingValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  holdingGain: {
    fontSize: 14,
    marginTop: 4,
  },
  positive: {
    color: '#34C759',
  },
  negative: {
    color: '#FF3B30',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default PortfolioScreen;
