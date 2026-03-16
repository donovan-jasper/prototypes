import { View, Text, TouchableOpacity } from 'react-native';
import { Attribution } from '../types';

interface Props {
  attribution: Attribution;
}

export default function AttributionBadge({ attribution }: Props) {
  return (
    <View style={{ 
      backgroundColor: '#f0f0f0', 
      padding: 8, 
      borderRadius: 4, 
      alignSelf: 'flex-start' 
    }}>
      <Text style={{ fontSize: 12 }}>
        Generated with {attribution.model}
      </Text>
    </View>
  );
}
