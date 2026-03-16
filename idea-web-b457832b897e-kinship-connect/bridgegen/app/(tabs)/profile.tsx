import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';

const ProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Image source={{ uri: user.photo }} style={styles.image} />
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.age}>{user.age}</Text>
      <Text style={styles.bio}>{user.bio}</Text>
      <Button title="Edit Profile" onPress={() => {}} />
      <Button title="Logout" onPress={logout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    marginBottom: 10,
  },
  age: {
    fontSize: 18,
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default ProfileScreen;
