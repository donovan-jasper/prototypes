import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { getAudiobooks } from '@/lib/db/audiobooks';
import AudiobookCard from '@/components/AudiobookCard';

export default function LibraryScreen() {
  const [audiobooks, setAudiobooks] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const loadAudiobooks = async () => {
      const books = await getAudiobooks();
      setAudiobooks(books);
    };
    loadAudiobooks();
  }, []);

  const handlePress = (id) => {
    router.push(`/audiobook/${id}`);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={audiobooks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AudiobookCard
            audiobook={item}
            onPress={() => handlePress(item.id)}
          />
        )}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
  },
});
