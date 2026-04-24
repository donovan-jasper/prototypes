import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';

const MyPlants = ({ navigation }) => {
  const [plants, setPlants] = useState([
    {
      id: '1',
      name: 'Monstera',
      species: 'Monstera deliciosa',
      photos: [
        {
          uri: 'https://images.unsplash.com/photo-1587402092301-725e37c70fd8',
          date: '2023-05-15',
          caption: 'First leaf appeared!'
        },
        {
          uri: 'https://images.unsplash.com/photo-1587351177732-5b0739d1bd44',
          date: '2023-06-20',
          caption: 'Growing nicely'
        }
      ],
      reminders: [
        { text: 'Water every 7 days', date: '2023-07-10' },
        { text: 'Fertilize next month', date: '2023-07-25' }
      ],
      communityPosts: [
        { author: 'GreenThumb123', content: 'My Monstera is doing great!', date: '2023-06-18' },
        { author: 'PlantLover', content: 'Just added mine to the collection!', date: '2023-06-22' }
      ]
    },
    {
      id: '2',
      name: 'Snake Plant',
      species: 'Sansevieria trifasciata',
      photos: [
        {
          uri: 'https://images.unsplash.com/photo-1587402092301-725e37c70fd8',
          date: '2023-04-10',
          caption: 'Bought this plant'
        }
      ],
      reminders: [
        { text: 'Water every 2 weeks', date: '2023-07-15' }
      ],
      communityPosts: []
    }
  ]);

  const renderPlantItem = ({ item }) => (
    <TouchableOpacity
      style={styles.plantItem}
      onPress={() => navigation.navigate('PlantDetail', { plant: item })}
    >
      <Image
        source={{ uri: item.photos && item.photos.length > 0 ? item.photos[0].uri : 'https://via.placeholder.com/100' }}
        style={styles.plantImage}
      />
      <View style={styles.plantInfo}>
        <Text style={styles.plantName}>{item.name}</Text>
        <Text style={styles.plantSpecies}>{item.species}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Plants</Text>
      <FlatList
        data={plants}
        renderItem={renderPlantItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    color: '#333',
  },
  list: {
    paddingHorizontal: 10,
  },
  plantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  plantImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  plantSpecies: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
});

export default MyPlants;
