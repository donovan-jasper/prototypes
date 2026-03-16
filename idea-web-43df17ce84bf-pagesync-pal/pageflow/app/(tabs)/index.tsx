import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useMediaStore } from '../../store/mediaStore';
import MediaCard from '../../components/MediaCard';

const HomeScreen = () => {
  const { activeMedia, loadMedia } = useMediaStore();

  useEffect(() => {
    loadMedia();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={activeMedia}
        renderItem={({ item }) => <MediaCard media={item} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default HomeScreen;
