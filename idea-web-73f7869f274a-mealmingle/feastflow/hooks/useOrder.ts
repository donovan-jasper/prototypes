import { useState, useEffect } from 'react';
import { createOrder, fetchOrders, addCartItem, fetchCartItems } from '../lib/database';

export const useOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const createNewOrder = async (order) => {
    setLoading(true);
    return new Promise((resolve) => {
      createOrder(order, (newOrder) => {
        setOrders([...orders, newOrder]);
        setLoading(false);
        resolve(newOrder);
      });
    });
  };

  const loadOrders = () => {
    setLoading(true);
    fetchOrders((fetchedOrders) => {
      setOrders(fetchedOrders);
      setLoading(false);
    });
  };

  const addItemToCart = async (item) => {
    setLoading(true);
    return new Promise((resolve) => {
      addCartItem(item, (newItem) => {
        const updatedOrders = orders.map(order => {
          if (order.id === item.orderId) {
            return {
              ...order,
              items: [...(order.items || []), newItem],
            };
          }
          return order;
        });
        setOrders(updatedOrders);
        setLoading(false);
        resolve(newItem);
      });
    });
  };

  const loadCartItems = (orderId) => {
    setLoading(true);
    fetchCartItems(orderId, (items) => {
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            items,
          };
        }
        return order;
      });
      setOrders(updatedOrders);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return {
    orders,
    loading,
    createOrder: createNewOrder,
    fetchOrders: loadOrders,
    addItemToCart,
    fetchCartItems: loadCartItems,
  };
};
