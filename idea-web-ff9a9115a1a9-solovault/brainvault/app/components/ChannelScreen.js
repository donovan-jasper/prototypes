import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getChannels } from '../utils/channel';

const ChannelScreen = () => {
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    const loadChannels = async () => {
      const channels = await getChannels();
      setChannels(channels);
    };
    loadChannels();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={channels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text style={styles.item}>{item.name}</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
});

export default ChannelScreen;
