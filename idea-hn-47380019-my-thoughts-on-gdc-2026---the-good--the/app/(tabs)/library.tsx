import { View, Text, FlatList } from 'react-native';
import GenerationCard from '../../components/GenerationCard';
import { useAppStore } from '../../store/app-store';

export default function LibraryScreen() {
  const generations = useAppStore(state => state.generations);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Your Library</Text>
      <FlatList
        data={generations}
        renderItem={({ item }) => <GenerationCard generation={item} />}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}
