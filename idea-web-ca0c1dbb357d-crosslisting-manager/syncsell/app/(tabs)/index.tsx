import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getSales } from '../../lib/db';
import { calculateWeeklyEarnings, getTopProducts, suggestPostingTime } from '../../lib/utils/analytics';
import AnalyticsChart from '../../components/AnalyticsChart';

export default function Dashboard() {
  const [sales, setSales] = useState([]);
  const [weeklyEarnings, setWeeklyEarnings] = useState({ total: 0, change: 0 });
  const [topProducts, setTopProducts] = useState([]);
  const [optimalPostingTime, setOptimalPostingTime] = useState('');

  useEffect(() => {
    getSales((fetchedSales) => {
      setSales(fetchedSales);
      
      if (fetchedSales.length > 0) {
        const earnings = calculateWeeklyEarnings(fetchedSales);
        setWeeklyEarnings(earnings);
        
        const products = getTopProducts(fetchedSales, 5);
        setTopProducts(products);
        
        const postingTime = suggestPostingTime(fetchedSales);
        setOptimalPostingTime(postingTime);
      }
    });
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.earningsCard}>
        <Text style={styles.earningsText}>Weekly Earnings</Text>
        <Text style={styles.earningsAmount}>${weeklyEarnings.total.toFixed(2)}</Text>
        <Text style={[styles.earningsChange, { color: weeklyEarnings.change >= 0 ? '#4CAF50' : '#F44336' }]}>
          {weeklyEarnings.change >= 0 ? '+' : ''}{weeklyEarnings.change.toFixed(1)}%
        </Text>
      </View>
      
      {sales.length > 0 && <AnalyticsChart sales={sales} />}
      
      <View style={styles.topProducts}>
        <Text style={styles.sectionTitle}>Top Selling Products</Text>
        {topProducts.length > 0 ? (
          topProducts.map((product, index) => (
            <Text key={index} style={styles.productItem}>
              {product.title} - ${product.total.toFixed(2)}
            </Text>
          ))
        ) : (
          <Text style={styles.emptyText}>No sales data yet</Text>
        )}
      </View>
      
      <View style={styles.postingTime}>
        <Text style={styles.sectionTitle}>Optimal Posting Time</Text>
        <Text style={styles.postingTimeText}>
          {optimalPostingTime || 'Not enough data yet'}
        </Text>
      </View>
    </ScrollView>
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
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  postingTime: {
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
  postingTimeText: {
    fontSize: 16,
  },
});
