import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';

interface FileGridProps {
  files: Array<{
    id: string;
    uri: string;
    type: string;
    category?: string;
  }>;
}

export function FileGrid({ files }: FileGridProps) {
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      {item.type.startsWith('image/') ? (
        <Image source={{ uri: item.uri }} style={styles.image} />
      ) : (
        <View style={styles.fileIcon}>
          <Text>{item.type.split('/')[1]}</Text>
        </View>
      )}
      {item.category && <Text style={styles.category}>{item.category}</Text>}
    </View>
  );

  return (
    <FlatList
      data={files}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={3}
      columnWrapperStyle={styles.row}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  item: {
    width: '32%',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 5,
  },
  fileIcon: {
    width: 100,
    height: 100,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  category: {
    marginTop: 5,
    fontSize: 12,
  },
});
