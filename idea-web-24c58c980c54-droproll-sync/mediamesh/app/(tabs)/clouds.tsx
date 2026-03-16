import React, { useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { useCloudStore } from '../../store/cloudStore';
import { useSyncStore } from '../../store/syncStore';
import CloudBadge from '../../components/CloudBadge';

const CloudsScreen = () => {
  const { clouds, loadClouds, connectCloud, disconnectCloud } = useCloudStore();
  const { syncCloud } = useSyncStore();

  useEffect(() => {
    loadClouds();
  }, []);

  const handleConnect = (service) => {
    connectCloud(service);
  };

  const handleDisconnect = (id) => {
    disconnectCloud(id);
  };

  const handleSync = (id) => {
    syncCloud(id);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <CloudBadge service={item.service} />
      <Text style={styles.text}>{item.service}</Text>
      <Button title="Disconnect" onPress={() => handleDisconnect(item.id)} />
      <Button title="Sync Now" onPress={() => handleSync(item.id)} />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={clouds}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      <Button title="Add Cloud" onPress={() => handleConnect('dropbox')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  text: {
    flex: 1,
    marginLeft: 10,
  },
});

export default CloudsScreen;
