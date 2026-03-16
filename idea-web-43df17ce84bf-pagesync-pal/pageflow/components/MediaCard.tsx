import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Media } from '../types';

interface MediaCardProps {
  media: Media;
}

const MediaCard: React.FC<MediaCardProps> = ({ media }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/media/${media.id}`);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.card}>
        <Text style={styles.title}>{media.title}</Text>
        <Text style={styles.progress}>
          {Math.round((media.currentProgress / media.totalProgress) * 100)}%
        </Text>
        <Text style={styles.type}>{media.type}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progress: {
    fontSize: 16,
    color: 'gray',
  },
  type: {
    fontSize: 14,
    color: 'gray',
  },
});

export default MediaCard;
