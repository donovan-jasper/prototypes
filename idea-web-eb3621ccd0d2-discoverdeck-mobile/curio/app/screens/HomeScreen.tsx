import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import SearchBar from '../components/SearchBar';
import AppCard from '../components/AppCard';
import { getRecommendations } from '../utils/recommendations';

const HomeScreen: React.FC = () => {
  const [apps, setApps] = React.useState([]);

  const handleSearch = async (query: string) => {
    const recommendations = await getRecommendations(query);
    setApps(recommendations);
  };

  const handleInstall = (url: string) => {
    // Handle app installation
    console.log(`Installing app from ${url}`);
  };

  return (
    <View style={styles.container}>
      <SearchBar onSearch={handleSearch} />
      <FlatList
        data={apps}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => <AppCard app={item} onInstall={handleInstall} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;
