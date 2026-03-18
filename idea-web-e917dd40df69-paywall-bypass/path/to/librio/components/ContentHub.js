import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { fetchContent } from '../services/Api';

const ContentHub = () => {
  const [content, setContent] = useState([]);

  useEffect(() => {
    fetchContent().then(data => setContent(data));
  }, []);

  return (
    <View>
      <FlatList
        data={content}
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

export default ContentHub;
