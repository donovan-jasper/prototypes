import { View, Text, Image, Button } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAppStore } from '../../store/app-store';

export default function GenerationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const generation = useAppStore(state => 
    state.generations.find(g => g.id.toString() === id)
  );

  if (!generation) {
    return (
      <View>
        <Text>Generation not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Image 
        source={{ uri: generation.imageUri }} 
        style={{ width: '100%', height: 300, borderRadius: 8 }} 
      />
      
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 16 }}>
        {generation.prompt}
      </Text>
      
      <Text>Model: {generation.attribution.model}</Text>
      <Text>Timestamp: {generation.attribution.timestamp}</Text>
      
      <Button 
        title="Share" 
        onPress={() => console.log('Share pressed')} 
      />
      
      <Button 
        title="Export Report" 
        onPress={() => console.log('Export report pressed')} 
      />
    </View>
  );
}
