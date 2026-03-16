import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SkillShot</Text>
      <Button
        title="Start Training"
        onPress={() => navigation.navigate('ARTraining')}
      />
      <Button
        title="View Stats"
        onPress={() => navigation.navigate('Stats')}
      />
      <Button
        title="Challenges"
        onPress={() => navigation.navigate('Challenges')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default HomeScreen;
