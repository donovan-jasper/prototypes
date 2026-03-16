import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [hobbies, setHobbies] = useState('');
  const navigation = useNavigation();

  const handleSave = () => {
    // Save profile to Firebase
    navigation.navigate('MatchScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Hobbies (comma separated)"
        value={hobbies}
        onChangeText={setHobbies}
      />
      <Button title="Save Profile" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
});

export default ProfileScreen;
