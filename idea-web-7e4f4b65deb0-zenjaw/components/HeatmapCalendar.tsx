import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TensionLog } from '@/types';
import { Colors } from '@/constants/colors';

interface HeatmapCalendarProps {
  logs: TensionLog[];
  days: number;
  onDayPress?: (date: Date) => void;
}

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

  const dayData = getDayData();
  const columns = days === 7 ? 7 : 6;
  const rows = Math.ceil(days / columns);

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {dayData.map((day, index) => {
          const color = getCellColor(day.tenseCount, day.relaxedCount);
          const isToday = day.date.toDateString() === new Date().toDateString();

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.cell,
                { backgroundColor: color },
                isToday && styles.todayCell,
                { width: `${100 / columns - 2}%` }
              ]}
              onPress={() => onDayPress?.(day.date)}
            >
              <Text style={styles.dayNumber}>
                {day.date.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

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
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cell: {
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: Colors.light.tint,
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.light.icon,
  },
});
