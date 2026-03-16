import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import CommunityCard from '../../components/CommunityCard';

const CommunityScreen = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Mock API call
        const mockActivities = [
          { id: '1', title: 'Virtual Book Club', description: 'Monthly book discussion', date: '2023-11-15', time: '7:00 PM' },
          { id: '2', title: 'Cooking Class', description: 'Learn to cook traditional dishes', date: '2023-11-20', time: '6:00 PM' },
          { id: '3', title: 'Game Night', description: 'Play board games online', date: '2023-11-25', time: '8:00 PM' },
        ];
        setActivities(mockActivities);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  if (error) {
    return <View style={styles.container}><Text>Error: {error.message}</Text></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CommunityCard activity={item} />}
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

export default CommunityScreen;
