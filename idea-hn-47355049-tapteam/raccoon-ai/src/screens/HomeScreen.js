import React from 'react';
import { View, Text, Button } from 'react-native';
import ConversationalInterface from '../components/ConversationalInterface';

const HomeScreen = ({ navigation }) => {
  return (
    <View>
      <Text>Home Screen</Text>
      <ConversationalInterface />
      <Button
        title="Task Chain"
        onPress={() => navigation.navigate('TaskScreen')}
      />
      <Button
        title="Session History"
        onPress={() => navigation.navigate('SessionHistoryScreen')}
      />
    </View>
  );
};

export default HomeScreen;
