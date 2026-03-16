import { useState, useEffect } from 'react';
import { getTransactions, addTransaction as dbAddTransaction, updateTransaction as dbUpdateTransaction, deleteTransaction as dbDeleteTransaction } from '../lib/database';
import { Transaction } from '../lib/types';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Failed to load transactions', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const result = await dbAddTransaction(transaction);
      const newTransaction = { ...transaction, id: result.insertId };
      setTransactions([newTransaction, ...transactions]);
    } catch (error) {
      console.error('Failed to add transaction', error);
      throw error;
    }
  };

  const updateTransaction = async (transaction: Transaction) => {
    try {
      await dbUpdateTransaction(transaction);
      setTransactions(transactions.map((t) => (t.id === transaction.id ? transaction : t)));
    } catch (error) {
      console.error('Failed to update transaction', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: number) => {
    try {
      await dbDeleteTransaction(id);
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Failed to delete transaction', error);
      throw error;
    }
  };

  return { transactions, loading, addTransaction, updateTransaction, deleteTransaction };
};
