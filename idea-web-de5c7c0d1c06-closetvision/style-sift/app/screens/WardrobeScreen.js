import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { getWardrobe } from '../services/wardrobeService';

const WardrobeScreen = () => {
  const [wardrobe, setWardrobe] = useState([]);

  useEffect(() => {
    const fetchWardrobe = async () => {
      const data = await getWardrobe();
      setWardrobe(data);
    };

    fetchWardrobe();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={wardrobe}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.name}</Text>
            <Text>{item.category}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default WardrobeScreen;
