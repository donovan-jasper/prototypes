import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { searchBooks, searchMovies, searchAudiobooks } from '../../lib/api';
import { Media, MediaType } from '../../types';
import { useMediaStore } from '../../store/mediaStore';
import { usePremiumStore } from '../../store/premiumStore';

const AddScreen = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Media[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedType, setSelectedType] = useState<MediaType>('book');

  const navigation = useNavigation();
  const { addMedia } = useMediaStore();
  const { isPremium } = usePremiumStore();

  const handleSearch = async () => {
    if (!query.trim()) {
      Alert.alert('Error', 'Please enter a search term');
      return;
    }

    setIsSearching(true);
    try {
      let results: Media[] = [];
      switch (selectedType) {
        case 'book':
          results = await searchBooks(query);
          break;
        case 'movie':
          results = await searchMovies(query);
          break;
        case 'audiobook':
          results = await searchAudiobooks(query);
          break;
        default:
          results = await searchBooks(query);
      }
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMedia = async (media: Media) => {
    try {
      await addMedia(media);
      Alert.alert('Success', `${media.title} added to your library!`);
      navigation.goBack();
    } catch (error) {
      console.error('Add media error:', error);
      Alert.alert('Error', 'Failed to add media. Please try again.');
    }
  };

  const renderItem = ({ item }: { item: Media }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleAddMedia(item)}
    >
      {item.coverUrl && (
        <Image
          source={{ uri: item.coverUrl }}
          style={styles.resultImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.resultType}>{item.type}</Text>
        {item.totalProgress > 0 && (
          <Text style={styles.resultProgress}>
            {item.totalProgress} {item.unit}{item.totalProgress > 1 ? 's' : ''}
          </Text>
        )}
      </View>
      <MaterialIcons name="add-circle-outline" size={24} color="#6200EE" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for media..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoFocus
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <ActivityIndicator color="white" />
          ) : (
            <MaterialIcons name="search" size={24} color="white" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.typeSelector}>
        {(['book', 'movie', 'audiobook'] as MediaType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              selectedType === type && styles.typeButtonSelected,
            ]}
            onPress={() => setSelectedType(type)}
          >
            <Text style={[
              styles.typeButtonText,
              selectedType === type && styles.typeButtonTextSelected,
            ]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isPremium && (
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate('BarcodeScanner')}
        >
          <MaterialIcons name="qr-code-scanner" size={24} color="#6200EE" />
          <Text style={styles.scanButtonText}>Scan Barcode</Text>
        </TouchableOpacity>
      )}

      {searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="search" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Search for media to add</Text>
          <Text style={styles.emptySubtext}>
            {isPremium
              ? 'Or scan a barcode to instantly add media'
              : 'Upgrade to premium to scan barcodes'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#6200EE',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  typeButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  typeButtonSelected: {
    backgroundColor: '#6200EE',
  },
  typeButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  typeButtonTextSelected: {
    color: 'white',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  scanButtonText: {
    color: '#6200EE',
    marginLeft: 8,
    fontWeight: '500',
  },
  resultsList: {
    paddingBottom: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultImage: {
    width: 50,
    height: 75,
    borderRadius: 4,
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  resultType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resultProgress: {
    fontSize: 14,
    color: '#6200EE',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AddScreen;
