import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useDecompilation } from '../../hooks/useDecompilation';
import { useNavigation } from '@react-navigation/native';

const ExploreScreen = () => {
  const { allDecompilations } = useDecompilation();
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  const filteredDecompilations = allDecompilations.filter((item) =>
    item.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Explore Decompilations</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 16, padding: 8 }}
        placeholder="Search decompilations..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredDecompilations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('decompile', { id: item.id })}
            style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#ccc' }}
          >
            <Text style={{ fontSize: 18 }}>{item.fileName}</Text>
            <Text style={{ color: '#666' }}>{new Date(item.timestamp).toLocaleString()}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default ExploreScreen;
