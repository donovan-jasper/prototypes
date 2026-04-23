import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { searchItems } from '../utils/search';
import { Picker } from '@react-native-picker/picker';

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [channelFilter, setChannelFilter] = useState('all');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const results = await searchItems(query, channelFilter, contentTypeFilter);
      setResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item.text}</Text>
      <Text style={styles.itemMeta}>
        {item.channel} • {item.contentType} • {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={setQuery}
        value={query}
        placeholder="Search your saved items..."
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />

      <View style={styles.filterContainer}>
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Channel:</Text>
          <Picker
            selectedValue={channelFilter}
            style={styles.picker}
            onValueChange={(itemValue) => setChannelFilter(itemValue)}
          >
            <Picker.Item label="All Channels" value="all" />
            <Picker.Item label="Work" value="work" />
            <Picker.Item label="Personal" value="personal" />
            <Picker.Item label="Ideas" value="ideas" />
          </Picker>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Content Type:</Text>
          <Picker
            selectedValue={contentTypeFilter}
            style={styles.picker}
            onValueChange={(itemValue) => setContentTypeFilter(itemValue)}
          >
            <Picker.Item label="All Types" value="all" />
            <Picker.Item label="Text" value="text" />
            <Picker.Item label="Image" value="image" />
            <Picker.Item label="Voice" value="voice" />
          </Picker>
        </View>
      </View>

      <TouchableOpacity
        style={styles.searchButton}
        onPress={handleSearch}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.searchButtonText}>Search</Text>
        )}
      </TouchableOpacity>

      {results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={styles.resultsList}
        />
      ) : (
        !isLoading && <Text style={styles.noResults}>No results found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  filterSection: {
    flex: 1,
    marginHorizontal: 5,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  picker: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsList: {
    flex: 1,
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  itemText: {
    fontSize: 16,
    marginBottom: 5,
  },
  itemMeta: {
    fontSize: 12,
    color: '#666',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontSize: 16,
  },
});

export default SearchScreen;
