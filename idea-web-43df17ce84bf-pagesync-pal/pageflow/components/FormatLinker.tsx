import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList } from 'react-native';
import { useMediaStore } from '../store/mediaStore';
import { Media } from '../types';

interface FormatLinkerProps {
  media: Media;
}

const FormatLinker: React.FC<FormatLinkerProps> = ({ media }) => {
  const { media: allMedia, linkFormats } = useMediaStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([]);

  const handleSearch = () => {
    setFilteredMedia(
      allMedia.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          item.id !== media.id
      )
    );
  };

  const handleLink = (linkedMedia: Media) => {
    linkFormats([media.id, linkedMedia.id]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Link Formats</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="Search for other formats"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Button title="Search" onPress={handleSearch} />
      <FlatList
        data={filteredMedia}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.title}</Text>
            <Text>{item.type}</Text>
            <Button title="Link" onPress={() => handleLink(item)} />
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
});

export default FormatLinker;
