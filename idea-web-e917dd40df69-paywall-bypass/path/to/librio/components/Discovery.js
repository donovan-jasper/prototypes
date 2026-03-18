import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { fetchRecommendations } from '../services/Api';

const Discovery = () => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetchRecommendations().then(data => setRecommendations(data));
  }, []);

  return (
    <View>
      <FlatList
        data={recommendations}
        renderItem={({ item }) => (
          <View>
            <Text>{item.title}</Text>
            <Text>{item.description}</Text>
          </View>
        )}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};

export default Discovery;
