import React, { useContext, useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GroupContext } from '../../contexts/GroupContext';
import GroupCard from '../../components/GroupCard';

export default function GroupsScreen() {
  const router = useRouter();
  const { groups, fetchGroups } = useContext(GroupContext);
  const [savedGroups, setSavedGroups] = useState([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    setSavedGroups(groups);
  }, [groups]);

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Saved Groups</Text>
      <FlatList
        data={savedGroups}
        renderItem={({ item }) => <GroupCard group={item} />}
        keyExtractor={item => item.id.toString()}
      />
      <Button
        mode="contained"
        onPress={() => router.push('/group/create')}
        style={styles.button}
      >
        Create New Group
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});
