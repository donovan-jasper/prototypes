import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useDecompilation } from '../../hooks/useDecompilation';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const { recentDecompilations } = useDecompilation();
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Recent Decompilations</Text>
      <FlatList
        data={recentDecompilations}
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

export default HomeScreen;
