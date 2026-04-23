import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { formatCurrency } from '../lib/utils/formatting';
import { calculateProfit } from '../lib/utils/calculations';

interface CSVExportButtonProps {
  data: any[];
  dateRange: { start: Date; end: Date };
  isPremium: boolean;
}

export function CSVExportButton({ data, dateRange, isPremium }: CSVExportButtonProps) {
  const exportToCSV = async () => {
    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'CSV export is available in the premium version. Upgrade to access this feature.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Prepare CSV content
      const header = 'Title,Platform,Sale Price,Sourcing Cost,Profit,Margin,Date\n';
      const rows = data.map(item => {
        const profit = calculateProfit({
          salePrice: item.price,
          sourcingCost: item.sourcingCost || 0,
          platform: item.platform,
          shippingCost: 0
        });

        return [
          `"${item.title.replace(/"/g, '""')}"`,
          item.platform,
          formatCurrency(item.price, false),
          formatCurrency(item.sourcingCost || 0, false),
          formatCurrency(profit.profit, false),
          profit.margin.toFixed(2),
          new Date(item.createdAt).toISOString().split('T')[0]
        ].join(',');
      });

      const csvContent = header + rows.join('\n');

      // Create file
      const fileUri = FileSystem.documentDirectory + 'sellsync_sales_export.csv';
      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      // Share file
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Sales Data',
        UTI: 'public.comma-separated-values-text'
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Error', 'Failed to export sales data. Please try again.');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, !isPremium && styles.premiumButton]}
      onPress={exportToCSV}
      disabled={!isPremium}
    >
      <Text style={styles.buttonText}>Export CSV</Text>
      {!isPremium && <Text style={styles.premiumLabel}>Premium</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignSelf: 'flex-start',
  },
  premiumButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  premiumLabel: {
    color: 'white',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
});
