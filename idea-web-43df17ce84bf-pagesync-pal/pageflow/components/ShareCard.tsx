import React from 'react';
import { View, Text, StyleSheet, Button, Share } from 'react-native';
import { Media } from '../types';

interface ShareCardProps {
  media: Media;
}

const ShareCard: React.FC<ShareCardProps> = ({ media }) => {
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `I'm ${Math.round((media.currentProgress / media.totalProgress) * 100)}% through ${media.title}!`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share Progress</Text>
      <Text style={styles.message}>
        I'm {Math.round((media.currentProgress / media.totalProgress) * 100)}% through {media.title}!
      </Text>
      <Button title="Share" onPress={handleShare} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    marginBottom: 16,
  },
});

export default ShareCard;
