import { useState } from 'react';
import { createPayment, fetchPayments } from '../lib/database';
import { processPayments, confirmPayment } from '../lib/stripe';

export const usePayment = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createNewPayment = async (payment) => {
    setLoading(true);
    setError(null);
    try {
      const newPayment = await createPayment(payment);
      setPayments([...payments, newPayment]);
      return newPayment;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedPayments = await fetchPayments(orderId);
      setPayments(fetchedPayments);
      return fetchedPayments;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const processOrderPayment = async (order) => {
    setLoading(true);
    setError(null);
    try {
      const result = await processPayments(order);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const confirmOrderPayment = async (paymentIntentClientSecret, paymentMethodId) => {
    setLoading(true);
    setError(null);
    try {
      const paymentIntent = await confirmPayment(paymentIntentClientSecret, paymentMethodId);
      return paymentIntent;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setupPaymentMethod = async (paymentMethodId) => {
    setLoading(true);
    setError(null);
    try {
      // Implement actual payment method setup logic
      return { success: true };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    payments,
    loading,
    error,
    createPayment: createNewPayment,
    fetchPayments: loadPayments,
    processPayment: processOrderPayment,
    confirmPayment: confirmOrderPayment,
    setupPaymentMethod,
  };
};
