import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useUser } from '../context/UserContext';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfileScreen'>;

type Props = {
  navigation: ProfileScreenNavigationProp;
};

const ProfileScreen = ({ navigation }: Props) => {
  const { currentUser, saveUserProfile } = useUser();
  const [name, setName] = useState('');
  const [hobbies, setHobbies] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setHobbies(currentUser.hobbies.join(', '));
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (name.trim() && hobbies.trim()) {
      const hobbiesArray = hobbies.split(',').map(h => h.trim()).filter(h => h.length > 0);
      await saveUserProfile({ name: name.trim(), hobbies: hobbiesArray });
      navigation.navigate('MatchScreen');
    }
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
        multiline
      />
      <TouchableOpacity 
        style={[styles.button, (!name.trim() || !hobbies.trim()) && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={!name.trim() || !hobbies.trim()}
      >
        <Text style={styles.buttonText}>Save Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    padding: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
