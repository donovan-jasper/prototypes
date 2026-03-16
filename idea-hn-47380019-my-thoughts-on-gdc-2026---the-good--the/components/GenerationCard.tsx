import { View, Text, Image, TouchableOpacity } from 'react-native';
import AttributionBadge from './AttributionBadge';
import { Generation } from '../types';

interface Props {
  generation: Generation;
}

export default function GenerationCard({ generation }: Props) {
  return (
    <TouchableOpacity style={{ marginBottom: 16 }}>
      <Image 
        source={{ uri: generation.imageUri }} 
        style={{ width: '100%', height: 200, borderRadius: 8 }} 
      />
      
      <View style={{ padding: 12 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>{generation.prompt}</Text>
        <AttributionBadge attribution={generation.attribution} />
      </View>
    </TouchableOpacity>
  );
}
