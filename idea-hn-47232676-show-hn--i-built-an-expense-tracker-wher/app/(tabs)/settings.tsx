import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useStore } from '../../lib/store';
import QRPairingModal from '../../components/QRPairingModal';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getExpenses } from '../../lib/database';

export default function SettingsScreen() {
  const { syncStatus, pairedDevice, isPremium, expenses } = useStore();
  const [showQRModal, setShowQRModal] = useState(false);

  const handleExportData = async () => {
    try {
      const expensesData = await getExpenses();
      const csvContent = [
        ['ID', 'Amount', 'Description', 'Category', 'Paid By', 'Split With', 'Date'].join(','),
        ...expensesData.map(expense =>
          [
            expense.id,
            expense.amount,
            `"${expense.description.replace(/"/g, '""')}"`,
            expense.category,
            expense.paidBy,
            `"${expense.splitWith.join(';')}"`,
            expense.date
          ].join(',')
        )
      ].join('\n');

      const fileUri = FileSystem.documentDirectory + 'pairpurse_expenses.csv';
      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Share your expenses',
        UTI: 'public.comma-separated-values-text',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all expenses and reset the app? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // In a real app, you would clear the database here
              // For this prototype, we'll just show a success message
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Pairing</Text>

        <TouchableOpacity
          style={styles.option}
          onPress={() => setShowQRModal(true)}
        >
          <Ionicons name="qr-code-outline" size={24} color="#2e78b7" />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionText}>Pair New Device</Text>
            {pairedDevice && (
              <Text style={styles.optionSubtext}>Connected to another device</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <View style={styles.option}>
          <Ionicons name="sync-outline" size={24} color="#2e78b7" />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionText}>Sync Status</Text>
            <Text style={styles.optionSubtext}>
              {syncStatus === 'connected' ? 'Connected' :
               syncStatus === 'syncing' ? 'Syncing...' :
               'Offline'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>

        <TouchableOpacity
          style={styles.option}
          onPress={handleExportData}
        >
          <Ionicons name="download-outline" size={24} color="#2e78b7" />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionText}>Export Expenses</Text>
            <Text style={styles.optionSubtext}>Save as CSV file</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, styles.dangerOption]}
          onPress={handleClearData}
        >
          <Ionicons name="trash-outline" size={24} color="#F44336" />
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionText, styles.dangerText]}>Clear All Data</Text>
            <Text style={[styles.optionSubtext, styles.dangerText]}>Delete all expenses and reset</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>

      {!isPremium && (
        <View style={[styles.section, styles.premiumSection]}>
          <Text style={styles.sectionTitle}>Premium Features</Text>

          <View style={styles.premiumFeature}>
            <Ionicons name="mic-outline" size={24} color="#2e78b7" />
            <View style={styles.premiumFeatureText}>
              <Text style={styles.premiumFeatureTitle}>Voice Input</Text>
              <Text style={styles.premiumFeatureDescription}>Add expenses by speaking naturally</Text>
            </View>
          </View>

          <View style={styles.premiumFeature}>
            <Ionicons name="people-outline" size={24} color="#2e78b7" />
            <View style={styles.premiumFeatureText}>
              <Text style={styles.premiumFeatureTitle}>Multi-Device Sync</Text>
              <Text style={styles.premiumFeatureDescription}>Connect up to 5 devices</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>
      )}

      <QRPairingModal
        visible={showQRModal}
        onClose={() => setShowQRModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 16,
    color: '#666',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  optionText: {
    fontSize: 16,
  },
  optionSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  dangerOption: {
    borderTopWidth: 1,
    borderTopColor: '#ffebee',
  },
  dangerText: {
    color: '#F44336',
  },
  premiumSection: {
    marginBottom: 0,
  },
  premiumFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  premiumFeatureText: {
    marginLeft: 16,
    flex: 1,
  },
  premiumFeatureTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  premiumFeatureDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  upgradeButton: {
    backgroundColor: '#2e78b7',
    padding: 16,
    alignItems: 'center',
    margin: 16,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
