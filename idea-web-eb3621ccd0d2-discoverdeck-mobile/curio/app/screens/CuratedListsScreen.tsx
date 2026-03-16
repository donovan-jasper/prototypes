import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import AppCard from '../components/AppCard';
import { getCuratedLists } from '../utils/curatedLists';

const CuratedListsScreen: React.FC = () => {
  const [lists, setLists] = React.useState([]);

  React.useEffect(() => {
    const fetchLists = async () => {
      const curatedLists = await getCuratedLists();
      setLists(curatedLists);
    };
    fetchLists();
  }, []);

  const handleInstall = (url: string) => {
    // Handle app installation
    console.log(`Installing app from ${url}`);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={lists}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <View style={styles.list}>
            <Text style={styles.listTitle}>{item.title}</Text>
            <FlatList
              data={item.apps}
              keyExtractor={(app) => app.name}
              renderItem={({ item: app }) => <AppCard app={app} onInstall={handleInstall} />}
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
  },
});

export default CuratedListsScreen;
