import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { TensionLog } from '@/types';
import { Colors } from '@/constants/colors';

interface HeatmapCalendarProps {
  logs: TensionLog[];
  days: number;
  onDayPress?: (date: Date) => void;
}

const screenWidth = Dimensions.get('window').width;
const cellSize = (screenWidth - 64) / 7;

export default function HeatmapCalendar({ logs, days, onDayPress }: HeatmapCalendarProps) {
  const getDayData = () => {
    const today = new Date();
    const dayData: { date: Date; tenseCount: number; relaxedCount: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= date && logDate < nextDay;
      });

      const tenseCount = dayLogs.filter(log => log.status === 'tense').length;
      const relaxedCount = dayLogs.filter(log => log.status === 'relaxed').length;

      dayData.push({ date, tenseCount, relaxedCount });
    }

    return dayData;
  };

  const getCellColor = (tenseCount: number, relaxedCount: number) => {
    if (tenseCount === 0 && relaxedCount === 0) {
      return Colors.light.border;
    }

    const total = tenseCount + relaxedCount;
    const tensionRatio = tenseCount / total;

    if (tensionRatio >= 0.7) {
      return Colors.light.tense;
    } else if (tensionRatio >= 0.4) {
      return '#f59e0b';
    } else {
      return Colors.light.relaxed;
    }
  };

  const getDayName = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const dayData = getDayData();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Tension Heatmap</Text>
        <Text style={styles.subHeaderText}>
          {days === 7 ? 'Last 7 days' : 'Last 30 days'}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.grid}>
          {dayData.map((day, index) => {
            const color = getCellColor(day.tenseCount, day.relaxedCount);
            const isToday = day.date.toDateString() === new Date().toDateString();
            const total = day.tenseCount + day.relaxedCount;
            const percentage = total > 0 ? Math.round((day.tenseCount / total) * 100) : 0;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.cell,
                  { backgroundColor: color },
                  isToday && styles.todayCell
                ]}
                onPress={() => onDayPress?.(day.date)}
                activeOpacity={0.7}
              >
                <Text style={styles.dayName}>{getDayName(day.date)}</Text>
                <Text style={styles.dayNumber}>{day.date.getDate()}</Text>
                {total > 0 && (
                  <Text style={styles.percentage}>{percentage}%</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: Colors.light.border }]} />
          <Text style={styles.legendText}>No data</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: Colors.light.relaxed }]} />
          <Text style={styles.legendText}>Relaxed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: '#f59e0b' }]} />
          <Text style={styles.legendText}>Mixed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: Colors.light.tense }]} />
          <Text style={styles.legendText}>Tense</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 16,
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  subHeaderText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cell: {
    width: cellSize,
    height: cellSize,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    padding: 4,
    marginRight: 8,
  },
  todayCell: {
    borderWidth: 2,
    borderColor: Colors.light.tint,
  },
  dayName: {
    fontSize: 10,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  percentage: {
    fontSize: 10,
    fontWeight: '500',
    color: '#fff',
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
});
