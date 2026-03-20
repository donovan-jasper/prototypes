import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

function Settings() {
  const navigation = useNavigation();

  return (
    <View>
      <Text>Settings</Text>
      <Button title="Go back" onPress={() => navigation.goBack()} />
    </View>
  );
}

export default Settings;
