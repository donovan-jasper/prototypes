import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Modal, FlatList } from 'react-native';
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayLogs, setDayLogs] = useState<TensionLog[]>([]);

  const dayData = useMemo(() => {
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
  }, [logs, days]);

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

  const handleDayPress = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const logsForDay = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startOfDay && logDate <= endOfDay;
    });

    setDayLogs(logsForDay);
    setSelectedDate(date);
    onDayPress?.(date);
  };

  const closeModal = () => {
    setSelectedDate(null);
  };

  const renderDayLogItem = ({ item }: { item: TensionLog }) => {
    const logDate = new Date(item.timestamp);
    const timeString = logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={styles.logItem}>
        <View style={styles.logTimeContainer}>
          <Text style={styles.logTime}>{timeString}</Text>
        </View>
        <View style={styles.logStatusContainer}>
          <View style={[
            styles.logStatusDot,
            { backgroundColor: item.status === 'tense' ? Colors.light.tense : Colors.light.relaxed }
          ]} />
          <Text style={styles.logStatusText}>
            {item.status === 'tense' ? 'Tense' : 'Relaxed'}
          </Text>
        </View>
        <Text style={styles.logBodyZone}>{item.bodyZone}</Text>
      </View>
    );
  };

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
                onPress={() => handleDayPress(day.date)}
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
          <View style={[styles.legendBox, { backgroundColor: Colors.light.relaxed }]} />
          <Text style={styles.legendText}>Relaxed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: '#f59e0b' }]} />
          <Text style={styles.legendText}>Moderate</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: Colors.light.tense }]} />
          <Text style={styles.legendText}>Tense</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: Colors.light.border }]} />
          <Text style={styles.legendText}>No data</Text>
        </View>
      </View>

      <Modal
        visible={selectedDate !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDate?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>

            {dayLogs.length > 0 ? (
              <FlatList
                data={dayLogs}
                renderItem={renderDayLogItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.logList}
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No tension logs for this day</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.light.background,
  },
  header: {
    marginBottom: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
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
  },
  cell: {
    width: cellSize,
    height: cellSize,
    borderRadius: 4,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: Colors.light.tint,
  },
  dayName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginTop: 2,
  },
  percentage: {
    fontSize: 10,
    color: Colors.light.text,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: Colors.light.text,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: Colors.light.tint,
  },
  logList: {
    paddingBottom: 16,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  logTimeContainer: {
    width: 60,
  },
  logTime: {
    fontSize: 14,
    color: Colors.light.text,
  },
  logStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  logStatusText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  logBodyZone: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textTransform: 'capitalize',
  },
  noDataContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
});
