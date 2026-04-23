import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useListingStore } from '../../lib/stores/listingStore';
import { calculateProfit } from '../../lib/utils/calculations';
import { formatCurrency, formatDate } from '../../lib/utils/formatting';
import { PlatformBadge } from '../../components/PlatformBadge';
import { DateRangePicker } from '../../components/DateRangePicker';
import { CSVExportButton } from '../../components/CSVExportButton';
import { Card } from 'react-native-paper';

export default function SalesScreen() {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date()
  });

  const soldListings = useListingStore(state =>
    state.listings.filter(
      listing =>
        listing.status === 'sold' &&
        new Date(listing.createdAt) >= dateRange.start &&
        new Date(listing.createdAt) <= dateRange.end
    )
  );

  const totalSales = soldListings.reduce((sum, listing) => sum + listing.price, 0);
  const totalProfit = soldListings.reduce((sum, listing) => {
    const profit = calculateProfit({
      salePrice: listing.price,
      sourcingCost: listing.sourcingCost || 0,
      platform: listing.platform,
      shippingCost: 0 // Assuming shipping is not tracked in basic version
    });
    return sum + profit.profit;
  }, 0);

  const avgMargin = soldListings.length > 0
    ? (totalProfit / totalSales) * 100
    : 0;

  const renderItem = ({ item }: { item: any }) => {
    const profit = calculateProfit({
      salePrice: item.price,
      sourcingCost: item.sourcingCost || 0,
      platform: item.platform,
      shippingCost: 0
    });

    return (
      <Card style={styles.saleItem} mode="outlined">
        <View style={styles.saleItemHeader}>
          <Text style={styles.saleItemTitle}>{item.title}</Text>
          <PlatformBadge platform={item.platform} />
        </View>
        <View style={styles.saleItemDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Sale Price:</Text>
            <Text style={styles.detailValue}>{formatCurrency(item.price)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Profit:</Text>
            <Text style={styles.detailValue}>{formatCurrency(profit.profit)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Margin:</Text>
            <Text style={styles.detailValue}>{profit.margin.toFixed(1)}%</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{formatDate(new Date(item.createdAt))}</Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sales Tracker</Text>
        <DateRangePicker
          dateRange={dateRange}
          onChange={setDateRange}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryContainer}>
        <Card style={styles.summaryCard} mode="outlined">
          <Text style={styles.summaryLabel}>Total Sales</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalSales)}</Text>
        </Card>
        <Card style={styles.summaryCard} mode="outlined">
          <Text style={styles.summaryLabel}>Total Profit</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalProfit)}</Text>
        </Card>
        <Card style={styles.summaryCard} mode="outlined">
          <Text style={styles.summaryLabel}>Avg Margin</Text>
          <Text style={styles.summaryValue}>{avgMargin.toFixed(1)}%</Text>
        </Card>
      </ScrollView>

      <View style={styles.exportContainer}>
        <CSVExportButton
          data={soldListings}
          dateRange={dateRange}
          isPremium={false} // Replace with actual premium check
        />
      </View>

      <FlatList
        data={soldListings}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No sales in this period</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryContainer: {
    marginBottom: 16,
  },
  summaryCard: {
    width: 150,
    padding: 16,
    marginRight: 8,
    borderRadius: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  exportContainer: {
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  saleItem: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  saleItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  saleItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  saleItemDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
