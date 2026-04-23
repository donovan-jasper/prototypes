import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import { getSymptomsByDateRange, deleteSymptom, Symptom } from '@/services/database';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

interface CycleCalendarProps {
  db: SQLite.SQLiteDatabase;
  predictedPeriodStart?: Date | null;
  ovulationDate?: Date | null;
}

interface DayData {
  date: Date;
  symptoms: Symptom[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isPredictedPeriod: boolean;
  isOvulationDay: boolean;
}

export default function CycleCalendar({ db, predictedPeriodStart, ovulationDate }: CycleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadCalendarData();
  }, [currentMonth, db, predictedPeriodStart, ovulationDate]);

  const loadCalendarData = async () => {
    setIsLoading(true);
    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);

      const symptoms = await getSymptomsByDateRange(db, calendarStart, calendarEnd);

      const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

      const dayDataArray: DayData[] = days.map(day => {
        const daySymptoms = symptoms.filter(s => {
          const symptomDate = new Date(s.date);
          return isSameDay(symptomDate, day);
        });

        const isPredictedPeriod = predictedPeriodStart
          ? isSameDay(day, predictedPeriodStart) ||
            (day > predictedPeriodStart && day < addDays(predictedPeriodStart, 5))
          : false;

        const isOvulationDay = ovulationDate ? isSameDay(day, ovulationDate) : false;

        return {
          date: day,
          symptoms: daySymptoms,
          isCurrentMonth: day.getMonth() === currentMonth.getMonth(),
          isToday: isSameDay(day, new Date()),
          isPredictedPeriod,
          isOvulationDay,
        };
      });

      setCalendarDays(dayDataArray);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDayColor = (dayData: DayData): string => {
    if (dayData.isPredictedPeriod) return '#D1FAE5';
    if (dayData.isOvulationDay) return '#FDE68A';
    if (dayData.symptoms.length === 0) return '#F3F4F6';

    const avgPain = dayData.symptoms.reduce((sum, s) => sum + s.painLevel, 0) / dayData.symptoms.length;

    if (avgPain >= 7) return '#FCA5A5';
    if (avgPain >= 4) return '#FDE047';
    return '#86EFAC';
  };

  const handleDayPress = (dayData: DayData) => {
    setSelectedDay(dayData);
    setModalVisible(true);
  };

  const handleDeleteSymptom = async (symptomId: number) => {
    try {
      await deleteSymptom(db, symptomId);
      await loadCalendarData();

      if (selectedDay) {
        const updatedDay = calendarDays.find(d => isSameDay(d.date, selectedDay.date));
        if (updatedDay) {
          setSelectedDay(updatedDay);
          if (updatedDay.symptoms.length === 0) {
            setModalVisible(false);
          }
        }
      }
    } catch (error) {
      console.error('Failed to delete symptom:', error);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const renderDay = ({ item }: { item: DayData }) => {
    const dayColor = getDayColor(item);
    const isGrayedOut = !item.isCurrentMonth;

    return (
      <TouchableOpacity
        style={[
          styles.dayCell,
          { backgroundColor: dayColor },
          isGrayedOut && styles.dayCellGrayed,
          item.isToday && styles.dayCellToday,
          item.isPredictedPeriod && styles.dayCellPredicted,
          item.isOvulationDay && styles.dayCellOvulation,
        ]}
        onPress={() => handleDayPress(item)}
        disabled={isGrayedOut}
      >
        <Text
          style={[
            styles.dayText,
            isGrayedOut && styles.dayTextGrayed,
            item.isToday && styles.dayTextToday,
          ]}
        >
          {format(item.date, 'd')}
        </Text>
        {item.symptoms.length > 0 && (
          <View style={styles.symptomIndicator}>
            <Text style={styles.symptomCount}>{item.symptoms.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSymptomItem = ({ item }: { item: Symptom }) => (
    <View style={styles.symptomItem}>
      <View style={styles.symptomHeader}>
        <Text style={styles.symptomTime}>{format(new Date(item.date), 'h:mm a')}</Text>
        <TouchableOpacity onPress={() => handleDeleteSymptom(item.id!)}>
          <MaterialCommunityIcons name="delete" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
      <View style={styles.symptomContent}>
        <View style={styles.painLevelContainer}>
          <Text style={styles.painLabel}>Pain Level:</Text>
          <View style={styles.painLevel}>
            {[...Array(10)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.painDot,
                  i < item.painLevel ? styles.painDotActive : styles.painDotInactive,
                ]}
              />
            ))}
          </View>
        </View>
        {item.location && (
          <Text style={styles.symptomDetail}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#6B7280" /> {item.location}
          </Text>
        )}
        {item.type && (
          <Text style={styles.symptomDetail}>
            <MaterialCommunityIcons name="alert-circle" size={16} color="#6B7280" /> {item.type}
          </Text>
        )}
        {item.mood && (
          <Text style={styles.symptomDetail}>
            <MaterialCommunityIcons name="emoticon-happy" size={16} color="#6B7280" /> Mood: {item.mood}
          </Text>
        )}
        {item.energyLevel && (
          <Text style={styles.symptomDetail}>
            <MaterialCommunityIcons name="battery" size={16} color="#6B7280" /> Energy: {item.energyLevel}
          </Text>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#8B5CF6" />
        </TouchableOpacity>

        <Text style={styles.monthTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>

        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <MaterialCommunityIcons name="chevron-right" size={28} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekdays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <Text key={index} style={styles.weekday}>{day}</Text>
        ))}
      </View>

      <FlatList
        data={calendarDays}
        renderItem={renderDay}
        keyExtractor={(item, index) => index.toString()}
        numColumns={7}
        contentContainerStyle={styles.calendarGrid}
        scrollEnabled={false}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDay ? format(selectedDay.date, 'MMMM d, yyyy') : ''}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedDay?.symptoms.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="emoticon-sad" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No symptoms logged for this day</Text>
              </View>
            ) : (
              <FlatList
                data={selectedDay?.symptoms || []}
                renderItem={renderSymptomItem}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                contentContainerStyle={styles.symptomList}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  navButton: {
    padding: 8,
  },
  weekdays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekday: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    width: '14.28%',
    textAlign: 'center',
  },
  calendarGrid: {
    flexGrow: 1,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 2,
  },
  dayCellGrayed: {
    opacity: 0.5,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  dayCellPredicted: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  dayCellOvulation: {
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  dayTextGrayed: {
    color: '#9CA3AF',
  },
  dayTextToday: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  symptomIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  symptomCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
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
    fontWeight: '600',
    color: '#1F2937',
  },
  symptomList: {
    paddingBottom: 16,
  },
  symptomItem: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  symptomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  symptomTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  symptomContent: {
    gap: 8,
  },
  painLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  painLabel: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  painLevel: {
    flexDirection: 'row',
    gap: 4,
  },
  painDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  painDotActive: {
    backgroundColor: '#EF4444',
  },
  painDotInactive: {
    backgroundColor: '#E5E7EB',
  },
  symptomDetail: {
    fontSize: 14,
    color: '#374151',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
