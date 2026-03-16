import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface AppCardProps {
  app: {
    name: string;
    description: string;
    icon: string;
    storeUrl: string;
  };
  onInstall: (url: string) => void;
}

const AppCard: React.FC<AppCardProps> = ({ app, onInstall }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: app.icon }} style={styles.icon} />
      <View style={styles.info}>
        <Text style={styles.name}>{app.name}</Text>
        <Text style={styles.description}>{app.description}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => onInstall(app.storeUrl)}>
        <Text style={styles.buttonText}>Install</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  icon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
  },
});

export default AppCard;
