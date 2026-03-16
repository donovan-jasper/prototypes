import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import ContraptionCard from '../../components/ContraptionCard';
import { listContraptions } from '../../lib/storage';

export default function GalleryScreen() {
  const [contraptions, setContraptions] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const loadContraptions = async () => {
      const savedContraptions = await listContraptions();
      const communityContraptions = [
        // Mock community contraptions for MVP
        { id: 'community-1', name: 'Catapult', thumbnail: 'catapult-thumb', isPremium: false },
        { id: 'community-2', name: 'Marble Run', thumbnail: 'marble-run-thumb', isPremium: true },
      ];
      setContraptions([...savedContraptions, ...communityContraptions]);
    };
    loadContraptions();
  }, []);

  const handleOpenContraption = (id) => {
    router.push(`/contraption/${id}`);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={contraptions}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <ContraptionCard
            contraption={item}
            onPress={() => handleOpenContraption(item.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
