import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameWeek, isSameMonth, addMonths, subMonths, isBefore, isAfter } from 'date-fns';
import { MILESTONE_DAYS, STREAK_COLORS, MAX_GRACE_DAYS_PER_WEEK } from '../lib/constants';
import { getGraceDaysUsedThisWeek, getConsecutiveStreakGroups } from '../lib/affirmations';

interface StreakDay {
  date: string;
  isGraceDay?: boolean;
}

interface StreakCalendarProps {
  streakData: StreakDay[];
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({ streakData }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [graceDaysUsed, setGraceDaysUsed] = React.useState(0);
  const [consecutiveGroups, setConsecutiveGroups] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const used = await getGraceDaysUsedThisWeek(currentMonth);
      setGraceDaysUsed(used);

      const groups = await getConsecutiveStreakGroups(currentMonth);
      setConsecutiveGroups(groups);
    };
    fetchData();
  }, [currentMonth]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const streakMap = new Map<string, boolean>();
  streakData.forEach(day => {
    streakMap.set(day.date, day.isGraceDay || false);
  });

  const milestoneDates = MILESTONE_DAYS.map(days => {
    const milestoneDate = new Date(currentMonth);
    milestoneDate.setDate(currentMonth.getDate() - days);
    return format(milestoneDate, 'yyyy-MM-dd');
  });

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const renderDay = (day: Date, index: number) => {
    const dayString = format(day, 'yyyy-MM-dd');
    const isStreakDay = streakMap.has(dayString);
    const isGraceDay = streakMap.get(dayString);
    const isMilestone = milestoneDates.includes(dayString);
    const isToday = isSameDay(day, new Date());

    let isInConsecutiveGroup = false;
    let isFirstInGroup = false;
    let isLastInGroup = false;

    consecutiveGroups.forEach(group => {
      const firstDate = group.start;
      const lastDate = group.end;

      if (dayString === firstDate) {
        isInConsecutiveGroup = true;
        isFirstInGroup = true;
      } else if (dayString === lastDate) {
        isInConsecutiveGroup = true;
        isLastInGroup = true;
      } else if (isAfter(parseISO(dayString), parseISO(firstDate)) && isBefore(parseISO(dayString), parseISO(lastDate))) {
        isInConsecutiveGroup = true;
      }
    });

    return (
      <View key={index} style={styles.dayContainer}>
        {isInConsecutiveGroup && (
          <View style={[
            styles.connectorLine,
            isFirstInGroup ? styles.firstConnector : null,
            isLastInGroup ? styles.lastConnector : null
          ]} />
        )}
        <View style={styles.dayContent}>
          <Text style={[
            styles.dayNumber,
            isToday ? styles.today : null,
            isMilestone ? styles.milestone : null
          ]}>
            {format(day, 'd')}
          </Text>
          {isStreakDay && (
            <View style={[
              styles.dot,
              { backgroundColor: isGraceDay ? STREAK_COLORS.grace : STREAK_COLORS.regular }
            ]} />
          )}
          {isMilestone && (
            <Text style={styles.milestoneBadge}>🎉</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth}>
          <Text style={styles.navButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthHeader}>{format(currentMonth, 'MMMM yyyy')}</Text>
        <TouchableOpacity onPress={goToNextMonth}>
          <Text style={styles.navButton}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekdays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <Text key={index} style={styles.weekday}>{day}</Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {daysInMonth.map((day, index) => (
          <View key={index} style={styles.dayWrapper}>
            {renderDay(day, index)}
          </View>
        ))}
      </View>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: STREAK_COLORS.regular }]} />
          <Text style={styles.legendText}>Completed Day</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: STREAK_COLORS.grace }]} />
          <Text style={styles.legendText}>Grace Day</Text>
        </View>
      </View>

      <View style={styles.graceDaysCounter}>
        <Text style={styles.graceDaysText}>
          Grace Days Used: {graceDaysUsed}/{MAX_GRACE_DAYS_PER_WEEK}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthHeader: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  navButton: {
    fontSize: 24,
    paddingHorizontal: 12,
  },
  weekdays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekday: {
    fontSize: 12,
    color: '#666',
    width: Dimensions.get('window').width / 7,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayWrapper: {
    width: Dimensions.get('window').width / 7,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayContent: {
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 14,
  },
  today: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  milestone: {
    color: '#FF6B6B',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    bottom: 4,
  },
  milestoneBadge: {
    position: 'absolute',
    top: -4,
    fontSize: 12,
  },
  connectorLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#4CAF50',
    width: '100%',
    top: '50%',
    marginTop: -1,
  },
  firstConnector: {
    width: '50%',
    left: '50%',
  },
  lastConnector: {
    width: '50%',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  graceDaysCounter: {
    marginTop: 16,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    alignItems: 'center',
  },
  graceDaysText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default StreakCalendar;
