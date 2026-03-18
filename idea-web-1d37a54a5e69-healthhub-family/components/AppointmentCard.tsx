import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Appointment, FamilyMember } from '../types';
import { format, isPast, isToday } from 'date-fns';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface AppointmentCardProps {
  appointment: Appointment;
  familyMember?: FamilyMember;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function AppointmentCard({ appointment, familyMember, onComplete, onDelete }: AppointmentCardProps) {
  const translateX = useSharedValue(0);
  const SWIPE_THRESHOLD = 80;

  const appointmentDate = new Date(appointment.date);
  const isPastAppointment = isPast(appointmentDate) && !isToday(appointmentDate);
  const isTodayAppointment = isToday(appointmentDate);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (appointment.completed) return;
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (appointment.completed) return;
      
      if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(300, {}, () => {
          runOnJS(onComplete)(appointment.id);
        });
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-300, {}, () => {
          runOnJS(onDelete)(appointment.id);
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
        <Animated.View style={[styles.card, animatedStyle, appointment.completed && styles.cardCompleted]}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={[styles.type, appointment.completed && styles.completedText]}>{appointment.type}</Text>
              {appointment.completed && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                  <Text style={styles.completedBadgeText}>Completed</Text>
                </View>
              )}
              {!appointment.completed && isPastAppointment && (
                <View style={styles.overdueBadge}>
                  <Text style={styles.overdueText}>Past</Text>
                </View>
              )}
              {!appointment.completed && isTodayAppointment && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayText}>Today</Text>
                </View>
              )}
            </View>
            {familyMember && (
              <Text style={[styles.memberName, appointment.completed && styles.completedText]}>{familyMember.name}</Text>
            )}
          </View>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={16} color={appointment.completed ? '#C7C7CC' : '#8E8E93'} />
              <Text style={[styles.detailText, appointment.completed && styles.completedText]}>{appointment.provider}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color={appointment.completed ? '#C7C7CC' : '#8E8E93'} />
              <Text style={[styles.detailText, appointment.completed && styles.completedText]}>
                {format(appointmentDate, 'MMM d, yyyy h:mm a')}
              </Text>
            </View>
            {appointment.location && (
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={16} color={appointment.completed ? '#C7C7CC' : '#8E8E93'} />
                <Text style={[styles.detailText, appointment.completed && styles.completedText]}>{appointment.location}</Text>
              </View>
            )}
            {appointment.notes && (
              <View style={styles.detailRow}>
                <Ionicons name="document-text-outline" size={16} color={appointment.completed ? '#C7C7CC' : '#8E8E93'} />
                <Text style={[styles.detailText, appointment.completed && styles.completedText]} numberOfLines={2}>
                  {appointment.notes}
                </Text>
              </View>
            )}
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
  cardCompleted: {
    opacity: 0.6,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  type: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  completedText: {
    color: '#8E8E93',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F7EC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
    gap: 4,
  },
  completedBadgeText: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '600',
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
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
  },
});
