import { useState } from 'react';
import { createPayment, fetchPayments } from '../lib/database';
import { processPayments, confirmPayment } from '../lib/stripe';

export const usePayment = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const createNewPayment = async (payment) => {
    setLoading(true);
    return new Promise((resolve) => {
      createPayment(payment, (newPayment) => {
        setPayments([...payments, newPayment]);
        setLoading(false);
        resolve(newPayment);
      });
    });
  };

  const loadPayments = (orderId) => {
    setLoading(true);
    fetchPayments(orderId, (fetchedPayments) => {
      setPayments(fetchedPayments);
      setLoading(false);
    });
  };

  const processOrderPayment = async (order) => {
    setLoading(true);
    try {
      const result = await processPayments(order);
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const confirmOrderPayment = async (paymentIntentClientSecret, paymentMethodId) => {
    setLoading(true);
    try {
      const paymentIntent = await confirmPayment(paymentIntentClientSecret, paymentMethodId);
      setLoading(false);
      return paymentIntent;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const setupPaymentMethod = async (paymentMethodId) => {
    setLoading(true);
    try {
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return {
    payments,
    loading,
    createPayment: createNewPayment,
    fetchPayments: loadPayments,
    processPayment: processOrderPayment,
    confirmPayment: confirmOrderPayment,
    setupPaymentMethod,
  };
};
