import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SwipeAction from '../components/SwipeAction';
import QuickAccessBar from '../components/QuickAccessBar';
import { initDB, getItems, updateItem } from '../utils/db';

const HomeScreen = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    initDB().then(() => {
      getItems().then(setItems);
    });
  }, []);

  const handleSwipeLeft = (item) => {
    const updatedItem = { ...item, archived: true };
    updateItem(updatedItem).then(() => {
      getItems().then(setItems);
    });
  };

  const handleSwipeRight = (item) => {
    const updatedItem = { ...item, muted: true };
    updateItem(updatedItem).then(() => {
      getItems().then(setItems);
    });
  };

  const handleSwipeUp = (item) => {
    const updatedItem = { ...item, pinned: true };
    updateItem(updatedItem).then(() => {
      getItems().then(setItems);
    });
  };

  const handleSwipeDown = (item) => {
    const updatedItem = { ...item, deleted: true };
    updateItem(updatedItem).then(() => {
      getItems().then(setItems);
    });
  };

  const quickAccessItems = [
    { name: 'Messages' },
    { name: 'Notifications' },
    { name: 'Apps' },
  ];

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <SwipeAction
          key={item.id}
          onSwipeLeft={() => handleSwipeLeft(item)}
          onSwipeRight={() => handleSwipeRight(item)}
          onSwipeUp={() => handleSwipeUp(item)}
          onSwipeDown={() => handleSwipeDown(item)}
        >
          <View style={styles.item}>
            <Text>{item.name}</Text>
          </View>
        </SwipeAction>
      ))}
      <QuickAccessBar items={quickAccessItems} onItemPress={(item) => console.log(item)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default HomeScreen;
