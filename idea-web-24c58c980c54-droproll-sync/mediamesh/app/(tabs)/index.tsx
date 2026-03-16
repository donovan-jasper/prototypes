import React, { useEffect } from 'react';
import { View, FlatList, Image, StyleSheet } from 'react-native';
import { useMediaStore } from '../../store/mediaStore';
import { useSyncStore } from '../../store/syncStore';
import MediaGrid from '../../components/MediaGrid';
import SyncProgress from '../../components/SyncProgress';

const GalleryScreen = () => {
  const { media, loadMedia } = useMediaStore();
  const { isSyncing } = useSyncStore();

  useEffect(() => {
    loadMedia();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Image source={{ uri: item.localPath }} style={styles.image} />
    </View>
  );

  return (
    <View style={styles.container}>
      {isSyncing && <SyncProgress />}
      <FlatList
        data={media}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
});

export default GalleryScreen;
