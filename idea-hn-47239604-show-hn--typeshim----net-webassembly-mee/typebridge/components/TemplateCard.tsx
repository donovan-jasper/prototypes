import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const TemplateCard = ({ template }) => {
  const router = useRouter();

  const handlePress = () => {
    // Create project from template
    router.push('/(tabs)/editor');
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Text style={styles.title}>{template.name}</Text>
      <Text style={styles.description}>{template.description}</Text>
      {template.isPremium && <Text style={styles.premium}>Premium</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  premium: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#6200ee',
    color: 'white',
    padding: 4,
    borderRadius: 4,
    fontSize: 12,
  },
});

export default TemplateCard;
