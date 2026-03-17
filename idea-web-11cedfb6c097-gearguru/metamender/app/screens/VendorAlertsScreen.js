import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Switch } from 'react-native';

const VendorAlertsScreen = () => {
  const [vendors, setVendors] = useState([
    { id: '1', name: 'Xur (Destiny 2)', nextReset: '2 days', enabled: true },
    { id: '2', name: 'Baro Ki\'Teer (Warframe)', nextReset: '5 days', enabled: false },
    { id: '3', name: 'Weekly Vendor (Diablo IV)', nextReset: '3 days', enabled: true },
    { id: '4', name: 'Traveling Merchant (PoE)', nextReset: '12 hours', enabled: false },
  ]);

  const toggleAlert = (id) => {
    setVendors(vendors.map(vendor =>
      vendor.id === id ? { ...vendor, enabled: !vendor.enabled } : vendor
    ));
  };

  const renderVendor = ({ item }) => (
    <View style={styles.vendorCard}>
      <View style={styles.vendorInfo}>
        <Text style={styles.vendorName}>{item.name}</Text>
        <Text style={styles.vendorReset}>Next reset: {item.nextReset}</Text>
      </View>
      <Switch
        value={item.enabled}
        onValueChange={() => toggleAlert(item.id)}
        trackColor={{ false: '#ccc', true: '#34C759' }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vendor Alerts</Text>
      <Text style={styles.description}>
        Get notified when your favorite in-game vendors reset their inventory.
      </Text>

      <FlatList
        data={vendors}
        keyExtractor={(item) => item.id}
        renderItem={renderVendor}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add Vendor</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  listContainer: {
    paddingBottom: 20,
  },
  vendorCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  vendorReset: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default VendorAlertsScreen;
