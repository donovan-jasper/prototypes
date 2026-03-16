import React from 'react';
import { View, FlatList, Image, StyleSheet } from 'react-native';
import CloudBadge from './CloudBadge';

const MediaGrid = ({ media }) => {
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Image source={{ uri: item.localPath }} style={styles.image} />
      <CloudBadge service={item.source} style={styles.badge} />
    </View>
  );

  return (
    <FlatList
      data={media}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={3}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 5,
  },
  item: {
    flex: 1,
    margin: 5,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
});

export default MediaGrid;
