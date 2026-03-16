import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TextInput, Button } from 'react-native';
import { getTransactions } from '@/lib/database';
import { TransactionRow } from '@/components/TransactionRow';
import { format } from 'date-fns';

export default function TimelineScreen() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const txs = await getTransactions();
    setTransactions(txs);
    setFilteredTransactions(txs);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterTransactions(query, startDate, endDate);
  };

  const handleDateFilter = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    filterTransactions(searchQuery, start, end);
  };

  const filterTransactions = (query, start, end) => {
    let filtered = [...transactions];

    if (query) {
      filtered = filtered.filter(tx =>
        tx.payee.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (start) {
      filtered = filtered.filter(tx =>
        new Date(tx.date) >= new Date(start)
      );
    }

    if (end) {
      filtered = filtered.filter(tx =>
        new Date(tx.date) <= new Date(end)
      );
    }

    setFilteredTransactions(filtered);
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by payee"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TextInput
          style={styles.dateInput}
          placeholder="Start date (YYYY-MM-DD)"
          value={startDate}
          onChangeText={(text) => handleDateFilter(text, endDate)}
        />
        <TextInput
          style={styles.dateInput}
          placeholder="End date (YYYY-MM-DD)"
          value={endDate}
          onChangeText={(text) => handleDateFilter(startDate, text)}
        />
      </View>
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionRow transaction={item} />}
        onRefresh={loadTransactions}
        refreshing={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  dateInput: {
    width: '45%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 8,
  },
});
