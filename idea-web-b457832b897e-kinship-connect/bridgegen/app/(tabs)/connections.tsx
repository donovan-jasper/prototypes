import React, { useEffect, useContext } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useConnections } from '../../hooks/useConnections';
import ConnectionCard from '../../components/ConnectionCard';
import { AuthContext } from '../../contexts/AuthContext';

const ConnectionsScreen = () => {
  const { user } = useContext(AuthContext);
  const { connections, loading, error, fetchConnections } = useConnections();

  useEffect(() => {
    if (user) {
      fetchConnections(user.id);
    }
  }, [user]);

  if (loading) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  if (error) {
    return <View style={styles.container}><Text>Error: {error.message}</Text></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={connections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ConnectionCard connection={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});

export default ConnectionsScreen;
