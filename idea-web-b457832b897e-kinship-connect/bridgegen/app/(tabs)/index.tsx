import React, { useEffect, useContext } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useMatches } from '../../hooks/useMatches';
import MatchCard from '../../components/MatchCard';
import { AuthContext } from '../../contexts/AuthContext';

const HomeScreen = () => {
  const { user } = useContext(AuthContext);
  const { matches, loading, error, fetchMatches } = useMatches();

  useEffect(() => {
    if (user) {
      fetchMatches(user.id);
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
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MatchCard match={item} />}
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

export default HomeScreen;
