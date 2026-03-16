import { useState } from 'react';
import { createPayment, fetchPayments } from '../lib/database';
import { processPayments } from '../lib/stripe';

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
    const paymentIntents = await processPayments(order);
    // Update payment status in database
    setLoading(false);
    return paymentIntents;
  };

  return {
    payments,
    loading,
    createPayment: createNewPayment,
    fetchPayments: loadPayments,
    processPayment: processOrderPayment,
  };
};
