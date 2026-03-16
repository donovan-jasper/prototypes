import { View, Text, FlatList, Button } from 'react-native';

const mockArtists = [
  { id: 1, name: 'Jane Smith', style: 'Abstract Art', followers: 1200 },
  { id: 2, name: 'John Doe', style: 'Photorealistic', followers: 850 },
  { id: 3, name: 'Alex Johnson', style: 'Digital Illustration', followers: 2100 },
];

export default function RegistryScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Creator Registry</Text>
      
      <Button 
        title="Register as Artist" 
        onPress={() => console.log('Register pressed')} 
      />
      
      <FlatList
        data={mockArtists}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            <Text>{item.style}</Text>
            <Text>{item.followers} followers</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}
