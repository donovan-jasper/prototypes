import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const TutorialOverlay = ({ tutorial, onComplete }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{tutorial.title}</Text>
        <Text style={styles.description}>{tutorial.description}</Text>
        <TouchableOpacity style={styles.button} onPress={onComplete}>
          <MaterialIcons name="check" size={24} color="white" />
          <Text style={styles.buttonText}>Got it!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 8,
    width: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
  },
});

export default TutorialOverlay;
