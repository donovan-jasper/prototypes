import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useProductStore } from '../../lib/store/useProductStore';
import AnalyticsChart from '../../components/AnalyticsChart';

export default function Dashboard() {
  const { products, sales } = useProductStore();

  const weeklyEarnings = calculateWeeklyEarnings(sales);
  const topProducts = getTopProducts(sales, 5);
  const optimalPostingTime = suggestPostingTime(sales);

  return (
    <View style={styles.container}>
      <View style={styles.earningsCard}>
        <Text style={styles.earningsText}>Weekly Earnings</Text>
        <Text style={styles.earningsAmount}>${weeklyEarnings.total}</Text>
        <Text style={styles.earningsChange}>{weeklyEarnings.change}%</Text>
      </View>
      <AnalyticsChart sales={sales} />
      <View style={styles.topProducts}>
        <Text style={styles.sectionTitle}>Top Selling Products</Text>
        {topProducts.map((product, index) => (
          <Text key={index} style={styles.productItem}>
            {product.title} - ${product.total}
          </Text>
        ))}
      </View>
      <View style={styles.postingTime}>
        <Text style={styles.sectionTitle}>Optimal Posting Time</Text>
        <Text style={styles.postingTimeText}>{optimalPostingTime}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  earningsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  earningsText: {
    fontSize: 16,
    color: '#666',
  },
  earningsAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  earningsChange: {
    fontSize: 16,
    color: '#4CAF50',
  },
  topProducts: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productItem: {
    fontSize: 16,
    marginBottom: 4,
  },
  postingTime: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postingTimeText: {
    fontSize: 16,
  },
});

function calculateWeeklyEarnings(sales) {
  // Implementation for calculating weekly earnings
}

function getTopProducts(sales, limit) {
  // Implementation for getting top products
}

function suggestPostingTime(sales) {
  // Implementation for suggesting optimal posting time
}
