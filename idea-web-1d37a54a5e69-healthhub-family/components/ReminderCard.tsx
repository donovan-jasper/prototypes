import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Reminder, FamilyMember } from '../types';
import { format, isPast, isToday } from 'date-fns';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface ReminderCardProps {
  reminder: Reminder;
  familyMember?: FamilyMember;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function ReminderCard({ reminder, familyMember, onComplete, onDelete }: ReminderCardProps) {
  const translateX = useSharedValue(0);
  const SWIPE_THRESHOLD = 80;

  const nextDate = new Date(reminder.nextDate);
  const isOverdue = isPast(nextDate) && !isToday(nextDate);
  const isDueToday = isToday(nextDate);

  const frequencyLabel = {
    once: 'One time',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
  }[reminder.frequency];

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(300, {}, () => {
          runOnJS(onComplete)(reminder.id);
        });
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-300, {}, () => {
          runOnJS(onDelete)(reminder.id);
        });
      } else {
        translateX.value = withTiming(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const completeBackgroundStyle = useAnimatedStyle(() => ({
    opacity: translateX.value > 0 ? Math.min(translateX.value / SWIPE_THRESHOLD, 1) : 0,
  }));

  const deleteBackgroundStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < 0 ? Math.min(Math.abs(translateX.value) / SWIPE_THRESHOLD, 1) : 0,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.actionBackground, styles.completeBackground, completeBackgroundStyle]}>
        <Ionicons name="checkmark-circle" size={32} color="#fff" />
      </Animated.View>
      <Animated.View style={[styles.actionBackground, styles.deleteBackground, deleteBackgroundStyle]}>
        <Ionicons name="trash" size={32} color="#fff" />
      </Animated.View>
      
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{reminder.title}</Text>
              {isOverdue && (
                <View style={styles.overdueBadge}>
                  <Text style={styles.overdueText}>Overdue</Text>
                </View>
              )}
              {isDueToday && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayText}>Today</Text>
                </View>
              )}
            </View>
            {familyMember && (
              <Text style={styles.memberName}>{familyMember.name}</Text>
            )}
          </View>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#8E8E93" />
              <Text style={styles.detailText}>
                {format(nextDate, 'MMM d, yyyy')}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="repeat-outline" size={16} color="#8E8E93" />
              <Text style={styles.detailText}>{frequencyLabel}</Text>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    position: 'relative',
  },
  actionBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  completeBackground: {
    backgroundColor: '#34C759',
    alignItems: 'flex-start',
    paddingLeft: 24,
  },
  deleteBackground: {
    backgroundColor: '#FF3B30',
    alignItems: 'flex-end',
    paddingRight: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  overdueBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  overdueText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  todayBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  todayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  memberName: {
    fontSize: 14,
    color: '#007AFF',
  },
  details: {
    flexDirection: 'row',
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#8E8E93',
  },
});
