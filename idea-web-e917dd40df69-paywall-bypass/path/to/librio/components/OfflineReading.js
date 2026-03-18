import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { fetchOfflineContent } from '../services/Storage';

const OfflineReading = () => {
  const [offlineContent, setOfflineContent] = useState([]);

  useEffect(() => {
    fetchOfflineContent().then(data => setOfflineContent(data));
  }, []);

  return (
    <View>
      <FlatList
        data={offlineContent}
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

export default OfflineReading;
