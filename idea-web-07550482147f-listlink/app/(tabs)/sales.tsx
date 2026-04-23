import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useListingStore } from '../../lib/stores/listingStore';
import { calculateProfit } from '../../lib/utils/calculations';
import { formatCurrency, formatDate } from '../../lib/utils/formatting';
import { PlatformBadge } from '../../components/PlatformBadge';
import { DateRangePicker } from '../../components/DateRangePicker';
import { CSVExportButton } from '../../components/CSVExportButton';
import { Card, ActivityIndicator, Divider, useTheme } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function SalesScreen() {
  const theme = useTheme();
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date()
  });
  const [isExporting, setIsExporting] = useState(false);

  const { listings, loadListings, loading, error } = useListingStore();

  useEffect(() => {
    loadListings({ status: 'sold' });
  }, []);

  const soldListings = listings.filter(
    listing =>
      listing.status === 'sold' &&
      new Date(listing.createdAt) >= dateRange.start &&
      new Date(listing.createdAt) <= dateRange.end
  );

  const totalSales = soldListings.reduce((sum, listing) => sum + listing.price, 0);
  const totalProfit = soldListings.reduce((sum, listing) => {
    const profit = calculateProfit({
      salePrice: listing.price,
      sourcingCost: listing.sourcingCost || 0,
      platform: listing.platform,
      shippingCost: 0
    });
    return sum + profit.profit;
  }, 0);

  const avgMargin = soldListings.length > 0
    ? (totalProfit / totalSales) * 100
    : 0;

  const handleExportCSV = async () => {
    if (soldListings.length === 0) {
      Alert.alert('No Data', 'There are no sales to export for the selected period');
      return;
    }

    setIsExporting(true);

    try {
      // Prepare CSV data
      const header = 'ID,Title,Platform,Sale Price,Sourcing Cost,Profit,Margin,Date\n';
      const rows = soldListings.map(item => {
        const profit = calculateProfit({
          salePrice: item.price,
          sourcingCost: item.sourcingCost || 0,
          platform: item.platform,
          shippingCost: 0
        });

        return [
          item.id,
          `"${item.title.replace(/"/g, '""')}"`,
          item.platform,
          item.price,
          item.sourcingCost || 0,
          profit.profit,
          profit.margin,
          formatDate(new Date(item.createdAt))
        ].join(',');
      }).join('\n');

      const csvContent = header + rows;
      const fileUri = FileSystem.documentDirectory + `sellsync_sales_${formatDate(dateRange.start)}_to_${formatDate(dateRange.end)}.csv`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Sales Data',
        UTI: 'public.comma-separated-values-text'
      });
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Export Failed', 'There was an error exporting the sales data');
    } finally {
      setIsExporting(false);
    }
  };

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
            <Text style={styles.detailLabel}>Sourcing Cost:</Text>
            <Text style={styles.detailValue}>{formatCurrency(item.sourcingCost || 0)}</Text>
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading sales data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading sales data: {error}</Text>
        <TouchableOpacity onPress={() => loadListings({ status: 'sold' })}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard} mode="outlined">
          <Text style={styles.summaryTitle}>Sales Summary</Text>
          <Divider style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Sales:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalSales)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Profit:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalProfit)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Average Margin:</Text>
            <Text style={styles.summaryValue}>{avgMargin.toFixed(1)}%</Text>
          </View>
        </Card>
      </View>

      <View style={styles.controlsContainer}>
        <DateRangePicker
          startDate={dateRange.start}
          endDate={dateRange.end}
          onChange={(start, end) => setDateRange({ start, end })}
        />
        <CSVExportButton
          onPress={handleExportCSV}
          disabled={isExporting}
          loading={isExporting}
        />
      </View>

      {soldListings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No sales found for the selected period</Text>
        </View>
      ) : (
        <FlatList
          data={soldListings}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryText: {
    color: 'blue',
    fontSize: 16,
  },
  summaryContainer: {
    marginBottom: 16,
  },
  summaryCard: {
    padding: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  saleItem: {
    marginBottom: 8,
    padding: 12,
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
    marginRight: 8,
  },
  saleItemDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
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
    paddingBottom: 16,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
