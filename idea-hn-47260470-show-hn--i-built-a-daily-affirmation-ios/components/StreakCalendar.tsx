import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameWeek, isSameMonth, addMonths, subMonths, isBefore, isAfter } from 'date-fns';
import { MILESTONE_DAYS, STREAK_COLORS } from '../lib/constants';
import { getGraceDaysUsedThisWeek } from '../lib/affirmations';

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

  React.useEffect(() => {
    const fetchGraceDays = async () => {
      const used = await getGraceDaysUsedThisWeek(currentMonth);
      setGraceDaysUsed(used);
    };
    fetchGraceDays();
  }, [currentMonth]);

  // Get the current month and create an array of all days in the month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Create a map of streak dates for quick lookup
  const streakMap = new Map<string, boolean>();
  streakData.forEach(day => {
    streakMap.set(day.date, day.isGraceDay || false);
  });

  // Get all milestone dates in the current month
  const milestoneDates = MILESTONE_DAYS.map(days => {
    const milestoneDate = new Date();
    milestoneDate.setDate(currentMonth.getDate() - days);
    return format(milestoneDate, 'yyyy-MM-dd');
  });

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Find consecutive days to draw connecting lines
  const getConsecutiveDays = () => {
    const consecutiveGroups: string[][] = [];
    let currentGroup: string[] = [];

    streakData.sort((a, b) => isBefore(parseISO(a.date), parseISO(b.date)) ? -1 : 1);

    streakData.forEach((day, index) => {
      if (index === 0) {
        currentGroup.push(day.date);
        return;
      }

      const prevDay = parseISO(streakData[index - 1].date);
      const currentDay = parseISO(day.date);

      if (isSameDay(currentDay, new Date(prevDay.getTime() + 24 * 60 * 60 * 1000))) {
        currentGroup.push(day.date);
      } else {
        if (currentGroup.length > 1) {
          consecutiveGroups.push([...currentGroup]);
        }
        currentGroup = [day.date];
      }
    });

    if (currentGroup.length > 1) {
      consecutiveGroups.push([...currentGroup]);
    }

    return consecutiveGroups;
  };

  const consecutiveGroups = getConsecutiveDays();

  const renderDay = (day: Date, index: number) => {
    const dayString = format(day, 'yyyy-MM-dd');
    const isStreakDay = streakMap.has(dayString);
    const isGraceDay = streakMap.get(dayString);
    const isMilestone = milestoneDates.includes(dayString);
    const isToday = isSameDay(day, new Date());

    // Check if this day is part of a consecutive streak
    let isInConsecutiveGroup = false;
    let isFirstInGroup = false;
    let isLastInGroup = false;

    consecutiveGroups.forEach(group => {
      const firstDate = group[0];
      const lastDate = group[group.length - 1];

      if (dayString === firstDate) {
        isInConsecutiveGroup = true;
        isFirstInGroup = true;
      } else if (dayString === lastDate) {
        isInConsecutiveGroup = true;
        isLastInGroup = true;
      } else if (group.includes(dayString)) {
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
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={styles.weekday}>{day}</Text>
        ))}
      </View>

      <View style={styles.calendar}>
        {daysInMonth.map((day, index) => renderDay(day, index))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: STREAK_COLORS.regular }]} />
          <Text style={styles.legendText}>Regular Day</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: STREAK_COLORS.grace }]} />
          <Text style={styles.legendText}>Grace Day</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendText}>🎉 Milestone</Text>
        </View>
      </View>

      <View style={styles.graceDayInfo}>
        <Text style={styles.graceDayText}>Grace Days Used This Week: {graceDaysUsed}/2</Text>
        <Text style={styles.graceDaySubtext}>You can use up to 2 grace days per week</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  monthHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  navButton: {
    fontSize: 20,
    paddingHorizontal: 10,
    color: '#4CAF50',
  },
  weekdays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekday: {
    fontSize: 14,
    color: '#666',
    width: Dimensions.get('window').width / 7,
    textAlign: 'center',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayContainer: {
    width: Dimensions.get('window').width / 7,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    fontSize: 16,
    color: '#333',
  },
  today: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  milestone: {
    color: '#FF5722',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  milestoneBadge: {
    fontSize: 12,
    marginTop: 2,
  },
  connectorLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#4CAF50',
    width: '100%',
    top: '50%',
    left: 0,
  },
  firstConnector: {
    width: '50%',
    left: '50%',
  },
  lastConnector: {
    width: '50%',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  graceDayInfo: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  graceDayText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  graceDaySubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});

export default StreakCalendar;
