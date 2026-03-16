import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { getIdeas } from '../../lib/ideas';
import SparkCard from '../../components/SparkCard';

export default function SparkFeed() {
  const [ideas, setIdeas] = useState([]);

  useEffect(() => {
    const fetchIdeas = async () => {
      const ideasData = await getIdeas();
      setIdeas(ideasData);
    };
    fetchIdeas();
  }, []);

  const renderItem = ({ item }) => <SparkCard idea={item} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={ideas}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={async () => {
          const ideasData = await getIdeas();
          setIdeas(ideasData);
        }}
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
});
