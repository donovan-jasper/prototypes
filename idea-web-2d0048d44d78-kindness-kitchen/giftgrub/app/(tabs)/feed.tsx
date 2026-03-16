import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useGiftStore } from '../../store/giftStore';
import GiftCard from '../../components/GiftCard';

const FeedScreen = () => {
  const { gifts } = useGiftStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gift Wall</Text>
      <FlatList
        data={gifts.filter(gift => gift.status === 'delivered')}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <GiftCard gift={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default FeedScreen;
