import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getUserProfile } from '../../lib/users';

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const profileData = await getUserProfile();
      setProfile(profileData);
    };
    fetchProfile();
  }, []);

  if (!profile) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{profile.name}</Text>
      <Text style={styles.score}>Spark Score: {profile.sparkScore}</Text>
      <Text style={styles.bio}>{profile.bio}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  score: {
    fontSize: 18,
    marginVertical: 10,
  },
  bio: {
    fontSize: 16,
  },
});
