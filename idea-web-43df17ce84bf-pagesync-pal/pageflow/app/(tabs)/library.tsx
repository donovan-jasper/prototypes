import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TextInput, Button } from 'react-native';
import { useMediaStore } from '../../store/mediaStore';
import MediaCard from '../../components/MediaCard';

const LibraryScreen = () => {
  const { media, loadMedia } = useMediaStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMedia, setFilteredMedia] = useState(media);

  useEffect(() => {
    loadMedia();
  }, []);

  useEffect(() => {
    setFilteredMedia(
      media.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, media]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search your library"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredMedia}
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
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
});

export default LibraryScreen;
