import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { fetchIntegratedContent } from '../services/Api';

const Integration = () => {
  const [integratedContent, setIntegratedContent] = useState([]);

  useEffect(() => {
    fetchIntegratedContent().then(data => setIntegratedContent(data));
  }, []);

  return (
    <View>
      <FlatList
        data={integratedContent}
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

export default Integration;
