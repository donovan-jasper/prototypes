import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useStore } from '../../store/appStore';
import AppIcon from '../../components/AppIcon';
import { useApps } from '../../hooks/useApps';
import { useModes } from '../../hooks/useModes';

const HomeScreen = () => {
  const { activeMode } = useStore();
  const { apps } = useApps();
  const { modes } = useModes();

  const filteredApps = apps.filter(app => activeMode?.appIds.includes(app.packageName));

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredApps}
        renderItem={({ item }) => <AppIcon app={item} />}
        keyExtractor={item => item.packageName}
        numColumns={4}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default HomeScreen;
