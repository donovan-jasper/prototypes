import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import { getSymptomsByDateRange, deleteSymptom, Symptom } from '@/services/database';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, subMonths, isSameDay, startOfWeek, endOfWeek } from 'date-fns';

interface CycleCalendarProps {
  db: SQLite.SQLiteDatabase;
}

interface DayData {
  date: Date;
  symptoms: Symptom[];
  isCurrentMonth: boolean;
}

export default function CycleCalendar({ db }: CycleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadCalendarData();
  }, [currentMonth, db]);

  const loadCalendarData = async () => {
    setIsLoading(true);
    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);
      
      const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
      
      const symptoms = await getSymptomsByDateRange(db, calendarStart, calendarEnd);
      
      const symptomsMap = new Map<string, Symptom[]>();
      symptoms.forEach(symptom => {
        const dateKey = format(new Date(symptom.date), 'yyyy-MM-dd');
        if (!symptomsMap.has(dateKey)) {
          symptomsMap.set(dateKey, []);
        }
        symptomsMap.get(dateKey)!.push(symptom);
      });
      
      const calendarData: DayData[] = days.map(day => ({
        date: day,
        symptoms: symptomsMap.get(format(day, 'yyyy-MM-dd')) || [],
        isCurrentMonth: day.getMonth() === currentMonth.getMonth(),
      }));
      
      setCalendarDays(calendarData);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
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
        const updatedSymptoms = selectedDay.symptoms.filter(s => s.id !== symptomId);
        setSelectedDay({ ...selectedDay, symptoms: updatedSymptoms });
        if (updatedSymptoms.length === 0) {
          setModalVisible(false);
        }
      }
    } catch (error) {
      console.error('Failed to delete symptom:', error);
    }
  };

  const getDayColor = (dayData: DayData) => {
    if (dayData.symptoms.length === 0) return '#F3F4F6';
    
    const avgPain = dayData.symptoms.reduce((sum, s) => sum + s.painLevel, 0) / dayData.symptoms.length;
    
    if (avgPain <= 3) return '#D1FAE5';
    if (avgPain <= 6) return '#FEF3C7';
    return '#FEE2E2';
  };

  const renderDay = (dayData: DayData) => {
    const isToday = isSameDay(dayData.date, new Date());
    const backgroundColor = getDayColor(dayData);
    const hasSymptoms = dayData.symptoms.length > 0;

    return (
      <TouchableOpacity
        key={dayData.date.toISOString()}
        style={[
          styles.dayCell,
          { backgroundColor },
          isToday && styles.todayCell,
        ]}
        onPress={() => handleDayPress(dayData)}
        disabled={!dayData.isCurrentMonth}
      >
        <Text
          style={[
            styles.dayText,
            !dayData.isCurrentMonth && styles.dayTextInactive,
            isToday && styles.todayText,
          ]}
        >
          {format(dayData.date, 'd')}
        </Text>
        {hasSymptoms && (
          <View style={styles.indicatorContainer}>
            {dayData.symptoms.slice(0, 3).map((_, index) => (
              <View key={index} style={styles.indicator} />
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
        <TouchableOpacity onPress={handlePreviousMonth} style={styles.navButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#8B5CF6" />
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>
        
        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <MaterialCommunityIcons name="chevron-right" size={28} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDaysContainer}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <View key={day} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {calendarDays.map(renderDay)}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#D1FAE5' }]} />
          <Text style={styles.legendText}>Low pain</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FEF3C7' }]} />
          <Text style={styles.legendText}>Medium</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FEE2E2' }]} />
          <Text style={styles.legendText}>High pain</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F3F4F6' }]} />
          <Text style={styles.legendText}>No data</Text>
        </View>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDay && format(selectedDay.date, 'MMMM d, yyyy')}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {selectedDay?.symptoms.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No symptoms logged for this day</Text>
                </View>
              ) : (
                selectedDay?.symptoms.map((symptom) => (
                  <View key={symptom.id} style={styles.symptomCard}>
                    <View style={styles.symptomHeader}>
                      <View style={styles.symptomHeaderLeft}>
                        <Text style={styles.symptomPainLevel}>Pain: {symptom.painLevel}/10</Text>
                        {symptom.location && (
                          <Text style={styles.symptomDetail}>📍 {symptom.location}</Text>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() => symptom.id && handleDeleteSymptom(symptom.id)}
                        style={styles.deleteButton}
                      >
                        <MaterialCommunityIcons name="delete" size={20} color="#DC2626" />
                      </TouchableOpacity>
                    </View>

                    {symptom.type && (
                      <Text style={styles.symptomDetail}>Type: {symptom.type}</Text>
                    )}
                    {symptom.mood && (
                      <Text style={styles.symptomDetail}>Mood: {symptom.mood}</Text>
                    )}
                    {symptom.energy !== null && symptom.energy !== undefined && (
                      <Text style={styles.symptomDetail}>Energy: {symptom.energy}/5</Text>
                    )}
                    {symptom.notes && (
                      <Text style={styles.symptomNotes}>{symptom.notes}</Text>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  dayTextInactive: {
    color: '#D1D5DB',
  },
  todayText: {
    color: '#8B5CF6',
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginTop: 2,
    gap: 2,
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B5CF6',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  legendText: {
    fontSize: 11,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalScroll: {
    padding: 20,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
  },
  symptomCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  symptomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  symptomHeaderLeft: {
    flex: 1,
  },
  symptomPainLevel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  symptomDetail: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  symptomNotes: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  deleteButton: {
    padding: 4,
  },
});
