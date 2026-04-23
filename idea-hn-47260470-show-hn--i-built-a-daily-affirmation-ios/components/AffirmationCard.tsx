import React from 'react';
import { View, Text, StyleSheet, Button, Share, Image, Platform } from 'react-native';
import MoodSelector from './MoodSelector';
import { shouldShowMilestone } from '../lib/affirmations';
import { useStore } from '../store/useStore';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';

interface AffirmationCardProps {
  affirmation: {
    text: string;
  };
  streakCount: number;
}

const AffirmationCard: React.FC<AffirmationCardProps> = ({ affirmation, streakCount }) => {
  const isPremium = useStore((state) => state.isPremium);
  const cardRef = React.useRef();

  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 0.8,
      });

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your affirmation',
        UTI: 'public.png' // for iOS
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getMilestoneImage = () => {
    if (streakCount >= 365) return require('../assets/milestones/365.png');
    if (streakCount >= 100) return require('../assets/milestones/100.png');
    if (streakCount >= 30) return require('../assets/milestones/30.png');
    if (streakCount >= 7) return require('../assets/milestones/7.png');
    return null;
  };

  return (
    <View style={styles.container}>
      <View ref={cardRef} collapsable={false} style={styles.card}>
        {shouldShowMilestone(streakCount) ? (
          <LinearGradient
            colors={['#4CAF50', '#8BC34A']}
            style={styles.milestoneContainer}
          >
            <Image
              source={getMilestoneImage()}
              style={styles.milestoneImage}
              resizeMode="contain"
            />
            <Text style={styles.milestoneText}>🎉 {streakCount} Day Milestone!</Text>
            <Text style={styles.milestoneSubtitle}>You're on fire! Keep going!</Text>
          </LinearGradient>
        ) : (
          <Text style={styles.streak}>Streak: {streakCount} days</Text>
        )}

        <Text style={styles.affirmation}>{affirmation.text}</Text>

        <MoodSelector />

        <View style={styles.buttonContainer}>
          <Button
            title="Share"
            onPress={handleShare}
            color="#4CAF50"
          />
          {!isPremium && (
            <Text style={styles.premiumHint}>Unlock more features with Premium</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  milestoneContainer: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  milestoneImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  milestoneText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  milestoneSubtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
  streak: {
    fontSize: 18,
    color: '#4CAF50',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  affirmation: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 30,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  premiumHint: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default AffirmationCard;
