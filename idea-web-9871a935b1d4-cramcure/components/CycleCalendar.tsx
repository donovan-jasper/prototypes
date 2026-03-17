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
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

interface CycleCalendarProps {
  db: SQLite.SQLiteDatabase;
}

interface DayData {
  date: Date;
  symptoms: Symptom[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isPredictedPeriod: boolean;
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

      const symptoms = await getSymptomsByDateRange(db, calendarStart, calendarEnd);

      const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
      
      const dayDataArray: DayData[] = days.map(day => {
        const daySymptoms = symptoms.filter(s => {
          const symptomDate = new Date(s.date);
          return isSameDay(symptomDate, day);
        });

        return {
          date: day,
          symptoms: daySymptoms,
          isCurrentMonth: day.getMonth() === currentMonth.getMonth(),
          isToday: isSameDay(day, new Date()),
          isPredictedPeriod: false,
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

  const renderDay = (dayData: DayData, index: number) => {
    const dayColor = getDayColor(dayData);
    const isGrayedOut = !dayData.isCurrentMonth;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayCell,
          { backgroundColor: dayColor },
          isGrayedOut && styles.dayCellGrayed,
          dayData.isToday && styles.dayCellToday,
          dayData.isPredictedPeriod && styles.dayCellPredicted,
        ]}
        onPress={() => handleDayPress(dayData)}
        disabled={isGrayedOut}
      >
        <Text
          style={[
            styles.dayText,
            isGrayedOut && styles.dayTextGrayed,
            dayData.isToday && styles.dayTextToday,
          ]}
        >
          {format(dayData.date, 'd')}
        </Text>
        {dayData.symptoms.length > 0 && (
          <View style={styles.symptomIndicator}>
            <Text style={styles.symptomCount}>{dayData.symptoms.length}</Text>
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
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#8B5CF6" />
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>
        
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <MaterialCommunityIcons name="chevron-right" size={28} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDaysRow}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={styles.weekDayText}>{day}</Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {calendarDays.map((dayData, index) => renderDay(dayData, index))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#86EFAC' }]} />
          <Text style={styles.legendText}>Low pain</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FDE047' }]} />
          <Text style={styles.legendText}>Medium</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FCA5A5' }]} />
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
                <Text style={styles.noSymptomsText}>No symptoms logged for this day</Text>
              ) : (
                selectedDay?.symptoms.map((symptom, index) => (
                  <View key={symptom.id || index} style={styles.symptomCard}>
                    <View style={styles.symptomHeader}>
                      <View style={styles.symptomHeaderLeft}>
                        <Text style={styles.symptomTime}>
                          {format(new Date(symptom.date), 'h:mm a')}
                        </Text>
                        <View style={[
                          styles.painBadge,
                          symptom.painLevel >= 7 && styles.painBadgeHigh,
                          symptom.painLevel >= 4 && symptom.painLevel < 7 && styles.painBadgeMedium,
                          symptom.painLevel < 4 && styles.painBadgeLow,
                        ]}>
                          <Text style={styles.painBadgeText}>Pain: {symptom.painLevel}/10</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => symptom.id && handleDeleteSymptom(symptom.id)}
                        style={styles.deleteButton}
                      >
                        <MaterialCommunityIcons name="delete" size={20} color="#DC2626" />
                      </TouchableOpacity>
                    </View>

                    {symptom.location && (
                      <View style={styles.symptomDetail}>
                        <MaterialCommunityIcons name="map-marker" size={16} color="#6B7280" />
                        <Text style={styles.symptomDetailText}>{symptom.location}</Text>
                      </View>
                    )}

                    {symptom.type && (
                      <View style={styles.symptomDetail}>
                        <MaterialCommunityIcons name="alert-circle" size={16} color="#6B7280" />
                        <Text style={styles.symptomDetailText}>{symptom.type}</Text>
                      </View>
                    )}

                    {symptom.mood && (
                      <View style={styles.symptomDetail}>
                        <MaterialCommunityIcons name="emoticon" size={16} color="#6B7280" />
                        <Text style={styles.symptomDetailText}>Mood: {symptom.mood}</Text>
                      </View>
                    )}

                    {symptom.energy !== undefined && symptom.energy !== null && (
                      <View style={styles.symptomDetail}>
                        <MaterialCommunityIcons name="lightning-bolt" size={16} color="#6B7280" />
                        <Text style={styles.symptomDetailText}>Energy: {symptom.energy}/5</Text>
                      </View>
                    )}

                    {symptom.notes && (
                      <View style={styles.notesContainer}>
                        <Text style={styles.notesLabel}>Notes:</Text>
                        <Text style={styles.notesText}>{symptom.notes}</Text>
                      </View>
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
    borderRadius: 12,
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
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  dayCellGrayed: {
    opacity: 0.3,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderRadius: 8,
  },
  dayCellPredicted: {
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderStyle: 'dashed',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  dayTextGrayed: {
    color: '#9CA3AF',
  },
  dayTextToday: {
    color: '#8B5CF6',
    fontWeight: '700',
  },
  symptomIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  symptomCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalScroll: {
    padding: 20,
  },
  noSymptomsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 40,
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
    marginBottom: 12,
  },
  symptomHeaderLeft: {
    flex: 1,
  },
  symptomTime: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  painBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  painBadgeLow: {
    backgroundColor: '#D1FAE5',
  },
  painBadgeMedium: {
    backgroundColor: '#FEF3C7',
  },
  painBadgeHigh: {
    backgroundColor: '#FEE2E2',
  },
  painBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  deleteButton: {
    padding: 4,
  },
  symptomDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  symptomDetailText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  notesContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
