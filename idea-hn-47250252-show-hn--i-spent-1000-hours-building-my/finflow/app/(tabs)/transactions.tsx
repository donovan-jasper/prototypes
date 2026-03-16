import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useTransactions } from '../../hooks/useTransactions';
import TransactionItem from '../../components/TransactionItem';
import { FloatingAction } from 'react-native-floating-action';
import { useNavigation } from '@react-navigation/native';

const TransactionsScreen = () => {
  const navigation = useNavigation();
  const { transactions, loading } = useTransactions();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions yet — tap + to add one</Text>
          </View>
        }
      />
      <FloatingAction
        actions={[
          {
            text: 'Add Transaction',
            icon: require('../../assets/images/add.png'),
            name: 'add_transaction',
            position: 1,
          },
        ]}
        onPressItem={(name) => {
          if (name === 'add_transaction') {
            navigation.navigate('add-transaction');
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

export default TransactionsScreen;
