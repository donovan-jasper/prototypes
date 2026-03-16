import { useEffect, useState } from 'react';
import { View, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { getDrawings } from '@/lib/db';
import { Drawing } from '@/lib/drawing';

export default function GalleryScreen() {
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadDrawings();
  }, []);

  const loadDrawings = async () => {
    const drawings = await getDrawings();
    setDrawings(drawings);
  };

  const renderItem = ({ item }: { item: Drawing }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => router.push(`/canvas/${item.id}`)}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={drawings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        onRefresh={loadDrawings}
        refreshing={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  item: {
    flex: 1,
    margin: 5,
    aspectRatio: 1,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
});
