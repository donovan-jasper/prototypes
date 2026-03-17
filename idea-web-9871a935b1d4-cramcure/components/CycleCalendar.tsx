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
import * as SQLite from 'expo-sqlite';
import { getSymptomsByDateRange } from '@/services/database';
import { Symptom } from '@/types/database';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CycleCalendarProps {
  db: SQLite.SQLiteDatabase;
}

interface DayData {
  date: Date;
  symptoms: Symptom[];
  painLevel: number;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CycleCalendar({ db }: CycleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [daysData, setDaysData] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadMonthData();
  }, [currentMonth, db]);

  const loadMonthData = async () => {
    setIsLoading(true);
    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      const symptoms = await getSymptomsByDateRange(db, monthStart, monthEnd);
      
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      const daysWithData: DayData[] = days.map(date => {
        const daySymptoms = symptoms.filter(s => 
          isSameDay(new Date(s.date), date)
        );
        
        const maxPain = daySymptoms.length > 0
          ? Math.max(...daySymptoms.map(s => s.painLevel))
          : 0;
        
        return {
          date,
          symptoms: daySymptoms,
          painLevel: maxPain,
        };
      });
      
      setDaysData(daysWithData);
    } catch (error) {
      console.error('Failed to load month data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPainColor = (painLevel: number): string => {
    if (painLevel === 0) return '#F9FAFB';
    if (painLevel <= 3) return '#86EFAC';
    if (painLevel <= 6) return '#FDE047';
    return '#FCA5A5';
  };

  const handleDayPress = (dayData: DayData) => {
    if (dayData.symptoms.length > 0) {
      setSelectedDay(dayData);
      setModalVisible(true);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const renderCalendarGrid = () => {
    const monthStart = startOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const monthEnd = endOfMonth(currentMonth);
    const endDate = endOfWeek(monthEnd);
    
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });
    
    return (
      <View style={styles.calendarGrid}>
        {WEEKDAYS.map(day => (
          <View key={day} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
        
        {allDays.map(date => {
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
          const dayData = daysData.find(d => isSameDay(d.date, date));
          const painLevel = dayData?.painLevel || 0;
          const hasSymptoms = dayData && dayData.symptoms.length > 0;
          
          return (
            <TouchableOpacity
              key={date.toISOString()}
              style={[
                styles.dayCell,
                { backgroundColor: isCurrentMonth ? getPainColor(painLevel) : '#F9FAFB' },
                !isCurrentMonth && styles.dayCellInactive,
              ]}
              onPress={() => dayData && handleDayPress(dayData)}
              disabled={!hasSymptoms}
            >
              <Text
                style={[
                  styles.dayText,
                  !isCurrentMonth && styles.dayTextInactive,
                  painLevel > 6 && styles.dayTextLight,
                ]}
              >
                {format(date, 'd')}
              </Text>
              {hasSymptoms && (
                <View style={styles.symptomDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      ) : (
        <>
          {renderCalendarGrid()}
          
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>Pain Level:</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#F9FAFB' }]} />
                <Text style={styles.legendText}>None</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#86EFAC' }]} />
                <Text style={styles.legendText}>Low (0-3)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FDE047' }]} />
                <Text style={styles.legendText}>Medium (4-6)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FCA5A5' }]} />
                <Text style={styles.legendText}>High (7-10)</Text>
              </View>
            </View>
          </View>
        </>
      )}

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
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {selectedDay?.symptoms.map((symptom, index) => (
                <View key={symptom.id || index} style={styles.symptomCard}>
                  <View style={styles.symptomHeader}>
                    <Text style={styles.symptomTime}>
                      {format(new Date(symptom.date), 'h:mm a')}
                    </Text>
                    <View style={[
                      styles.painBadge,
                      { backgroundColor: getPainColor(symptom.painLevel) }
                    ]}>
                      <Text style={[
                        styles.painBadgeText,
                        symptom.painLevel > 6 && styles.painBadgeTextLight
                      ]}>
                        Pain: {symptom.painLevel}/10
                      </Text>
                    </View>
                  </View>

                  {symptom.location && (
                    <View style={styles.symptomRow}>
                      <MaterialCommunityIcons name="map-marker" size={16} color="#6B7280" />
                      <Text style={styles.symptomLabel}>Location:</Text>
                      <Text style={styles.symptomValue}>{symptom.location}</Text>
                    </View>
                  )}

                  {symptom.type && (
                    <View style={styles.symptomRow}>
                      <MaterialCommunityIcons name="alert-circle" size={16} color="#6B7280" />
                      <Text style={styles.symptomLabel}>Type:</Text>
                      <Text style={styles.symptomValue}>{symptom.type}</Text>
                    </View>
                  )}

                  {symptom.mood && (
                    <View style={styles.symptomRow}>
                      <MaterialCommunityIcons name="emoticon" size={16} color="#6B7280" />
                      <Text style={styles.symptomLabel}>Mood:</Text>
                      <Text style={styles.symptomValue}>{symptom.mood}</Text>
                    </View>
                  )}

                  {symptom.energy !== null && symptom.energy !== undefined && (
                    <View style={styles.symptomRow}>
                      <MaterialCommunityIcons name="lightning-bolt" size={16} color="#6B7280" />
                      <Text style={styles.symptomLabel}>Energy:</Text>
                      <Text style={styles.symptomValue}>{symptom.energy}/5</Text>
                    </View>
                  )}

                  {symptom.notes && (
                    <View style={styles.notesContainer}>
                      <Text style={styles.notesLabel}>Notes:</Text>
                      <Text style={styles.notesText}>{symptom.notes}</Text>
                    </View>
                  )}
                </View>
              ))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 4,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  weekdayCell: {
    width: '14.28%',
    paddingVertical: 8,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
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
  dayCellInactive: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  dayTextInactive: {
    color: '#9CA3AF',
  },
  dayTextLight: {
    color: '#FFFFFF',
  },
  symptomDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
  },
  legend: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    padding: 20,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  symptomTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  painBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  painBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  painBadgeTextLight: {
    color: '#FFFFFF',
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  symptomLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  symptomValue: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  notesContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
});
