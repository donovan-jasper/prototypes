import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

interface Channel {
  id: string;
  name: string;
}

interface ChannelSelectorProps {
  onSelect: (channel: Channel) => void;
}

const channels: Channel[] = [
  { id: 'default', name: 'Default Channel' },
  { id: 'team', name: 'Team Channel' },
  { id: 'personal', name: 'Personal Channel' },
];

export default function ChannelSelector({ onSelect }: ChannelSelectorProps) {
  const [selectedChannel, setSelectedChannel] = useState(null);

  const handleSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    onSelect(channel);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a channel:</Text>
      <FlatList
        data={channels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.channel} onPress={() => handleSelect(item)}>
            <Text style={styles.channelName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  channel: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  channelName: {
    fontSize: 16,
  },
});
