import React from 'react';
import { StyleSheet, ScrollView, View, FlatList } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import { useAppStore } from '../../store/app-store';

interface Order {
  id: string;
  platform: string;
  itemName: string;
  price: number;
  status: 'pending' | 'shipped' | 'delivered';
  date: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    platform: 'ebay',
    itemName: 'Vintage Leather Jacket',
    price: 89.99,
    status: 'shipped',
    date: '2026-03-17T14:30:00Z',
  },
  {
    id: '2',
    platform: 'etsy',
    itemName: 'Handmade Ceramic Mug Set',
    price: 45.00,
    status: 'pending',
    date: '2026-03-18T09:15:00Z',
  },
  {
    id: '3',
    platform: 'depop',
    itemName: 'Vintage Band T-Shirt',
    price: 35.00,
    status: 'delivered',
    date: '2026-03-16T11:20:00Z',
  },
];

const platformColors: Record<string, string> = {
  ebay: '#E53238',
  etsy: '#F1641E',
  depop: '#FF0000',
  poshmark: '#630F3E',
  facebook: '#1877F2',
};

const statusColors: Record<string, string> = {
  pending: '#FF9800',
  shipped: '#2196F3',
  delivered: '#4CAF50',
};

export default function DashboardScreen() {
  const { listings, platforms, isSyncing, triggerSync } = useAppStore();

  const activeListings = listings.filter(l => l.quantity > 0).length;
  const connectedPlatforms = platforms.filter(p => p.enabled).length;

  const todayRevenue = 89.99;
  const weekRevenue = 169.99;
  const monthRevenue = 1247.50;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <Card style={styles.orderCard}>
      <Card.Content>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <View style={styles.orderTitleRow}>
              <View style={[styles.platformDot, { backgroundColor: platformColors[item.platform] }]} />
              <Text style={styles.orderTitle} numberOfLines={1}>
                {item.itemName}
              </Text>
            </View>
            <Text style={styles.orderPrice}>${item.price.toFixed(2)}</Text>
          </View>
          <View style={styles.orderStatus}>
            <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
              <Text style={styles.statusText}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
            <Text style={styles.orderDate}>{formatDate(item.date)}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sales Summary</Text>
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.summaryLabel}>Today</Text>
              <Text style={styles.summaryAmount}>${todayRevenue.toFixed(2)}</Text>
            </Card.Content>
          </Card>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.summaryLabel}>This Week</Text>
              <Text style={styles.summaryAmount}>${weekRevenue.toFixed(2)}</Text>
            </Card.Content>
          </Card>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.summaryLabel}>This Month</Text>
              <Text style={styles.summaryAmount}>${monthRevenue.toFixed(2)}</Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{activeListings}</Text>
              <Text style={styles.statLabel}>Active Listings</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{connectedPlatforms}</Text>
              <Text style={styles.statLabel}>Connected Platforms</Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      <View style={styles.section}>
        <Button
          mode="contained"
          onPress={triggerSync}
          loading={isSyncing}
          disabled={isSyncing}
          style={styles.syncButton}
          icon="sync"
        >
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </Button>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        <FlatList
          data={mockOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          scrollEnabled={false}
          contentContainerStyle={styles.ordersList}
        />
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryCard: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  syncButton: {
    marginTop: 4,
  },
  ordersList: {
    gap: 8,
  },
  orderCard: {
    marginBottom: 0,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  platformDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  orderTitle: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  orderStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  orderDate: {
    fontSize: 11,
    color: '#999',
  },
  bottomPadding: {
    height: 24,
  },
});
