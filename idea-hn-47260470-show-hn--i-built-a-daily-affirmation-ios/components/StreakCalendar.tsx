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

  const getConsecutiveDays = () => {
    const consecutiveGroups: string[][] = [];
    let currentGroup: string[] = [];

    const sortedStreakData = [...streakData].sort((a, b) =>
      isBefore(parseISO(a.date), parseISO(b.date)) ? -1 : 1
    );

    sortedStreakData.forEach((day, index) => {
      if (index === 0) {
        currentGroup.push(day.date);
        return;
      }

      const prevDay = parseISO(sortedStreakData[index - 1].date);
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

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: STREAK_COLORS.regular }]} />
          <Text style={styles.legendText}>Completed Day</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: STREAK_COLORS.grace }]} />
          <Text style={styles.legendText}>Grace Day</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendText}>🎉</Text>
          <Text style={styles.legendText}>Milestone</Text>
        </View>
      </View>

      <View style={styles.graceDaysInfo}>
        <Text style={styles.graceDaysText}>
          Grace Days Used This Week: {graceDaysUsed}/2
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    margin: 10,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  navButton: {
    fontSize: 24,
    color: '#4CAF50',
    paddingHorizontal: 10,
  },
  weekdays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
    height: 50,
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
    zIndex: 1,
  },
  dayNumber: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  today: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  milestone: {
    fontWeight: 'bold',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 3,
  },
  milestoneBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    fontSize: 12,
  },
  connectorLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#4CAF50',
    zIndex: 0,
  },
  firstConnector: {
    left: '50%',
    right: 0,
    top: '50%',
  },
  lastConnector: {
    left: 0,
    right: '50%',
    top: '50%',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
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
  graceDaysInfo: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  graceDaysText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default StreakCalendar;
