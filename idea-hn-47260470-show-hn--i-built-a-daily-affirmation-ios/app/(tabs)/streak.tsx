import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Platform } from 'react-native';
import StreakCalendar from '../../components/StreakCalendar';
import { getStreakDataForCalendar, getGraceDaysUsedThisWeek, shouldShowMilestone, getLongestStreak } from '../../lib/affirmations';
import { useStore } from '../../store/useStore';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { MILESTONE_DAYS } from '../../lib/constants';

const StreakScreen = () => {
  const [streakData, setStreakData] = useState([]);
  const [graceDaysUsed, setGraceDaysUsed] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [longestStreak, setLongestStreak] = useState(0);
  const { streakCount } = useStore();
  const calendarRef = React.useRef();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getStreakDataForCalendar();
      setStreakData(data);

      const today = new Date();
      const used = await getGraceDaysUsedThisWeek(today);
      setGraceDaysUsed(used);

      const longest = await getLongestStreak();
      setLongestStreak(longest);
    };

    fetchData();
  }, []);

  const handleShareMilestone = async () => {
    if (!calendarRef.current) return;

    setIsSharing(true);

    try {
      const uri = await captureRef(calendarRef, {
        format: 'png',
        quality: 0.8,
      });

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your streak',
        UTI: 'public.png' // for iOS
      });
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const nextMilestone = React.useMemo(() => {
    const next = MILESTONE_DAYS.find(day => day > streakCount);
    return next || 365;
  }, [streakCount]);

  const getMilestoneImage = () => {
    if (streakCount >= 365) return require('../../assets/milestones/365.png');
    if (streakCount >= 100) return require('../../assets/milestones/100.png');
    if (streakCount >= 30) return require('../../assets/milestones/30.png');
    if (streakCount >= 7) return require('../../assets/milestones/7.png');
    return null;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Streak</Text>
        <Text style={styles.streakCount}>{streakCount} days</Text>

        {shouldShowMilestone(streakCount) && (
          <LinearGradient
            colors={['#4CAF50', '#8BC34A']}
            style={styles.milestoneContainer}
          >
            <Text style={styles.milestoneText}>🎉 Milestone Reached!</Text>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareMilestone}
              disabled={isSharing}
            >
              <Text style={styles.shareButtonText}>
                {isSharing ? 'Sharing...' : 'Share Milestone'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        )}
      </View>

      <View ref={calendarRef} collapsable={false}>
        <StreakCalendar streakData={streakData} />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Current Streak</Text>
          <Text style={styles.statValue}>{streakCount} days</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Longest Streak</Text>
          <Text style={styles.statValue}>{longestStreak} days</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Grace Days Used</Text>
          <Text style={styles.statValue}>{graceDaysUsed}/2</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Next Milestone: {nextMilestone} days</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min((streakCount / nextMilestone) * 100, 100)}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {streakCount} of {nextMilestone} days
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>What are Grace Days?</Text>
        <Text style={styles.infoText}>
          Grace days allow you to skip a day without breaking your streak. You can use up to 2 grace days per week.
          This helps maintain your momentum when life gets busy.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  streakCount: {
    fontSize: 20,
    color: '#4CAF50',
    marginTop: 5,
    fontWeight: 'bold',
  },
  milestoneContainer: {
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  milestoneText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  shareButton: {
    marginTop: 10,
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  shareButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'white',
    marginVertical: 10,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  progressContainer: {
    padding: 15,
    backgroundColor: 'white',
    marginVertical: 10,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'right',
  },
  infoBox: {
    padding: 15,
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default StreakScreen;
