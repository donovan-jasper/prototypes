import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MockApp } from '../data/mockApps';

interface AppCardProps {
  app: MockApp;
  onInstall?: (url: string) => void;
}

const AppCard: React.FC<AppCardProps> = ({ app, onInstall }) => {
  const handleInstall = () => {
    if (onInstall) {
      onInstall(app.storeUrl);
    } else {
      Linking.openURL(app.storeUrl);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: app.icon }} style={styles.icon} />
        <View style={styles.info}>
          <Text style={styles.name}>{app.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.rating}>{app.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.description}>{app.description}</Text>

      <View style={styles.tagsContainer}>
        {app.tags.slice(0, 3).map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.installButton} onPress={handleInstall}>
        <Text style={styles.installText}>Install</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  installButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  installText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AppCard;
