import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeatmapCalendar from '@/components/HeatmapCalendar';
import PremiumGate from '@/components/PremiumGate';
import { useTensionLog } from '@/hooks/useTensionLog';
import { usePremium } from '@/hooks/usePremium';
import { Colors } from '@/constants/colors';
import { TensionLog } from '@/types';

export default function InsightsScreen() {
  const { logs, loading, calculateTensionScore, identifyPatterns, getLogsForDate } = useTensionLog();
  const { isPremium, purchasePremium } = usePremium();
  const [viewDays, setViewDays] = useState<7 | 30>(7);
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayLogs, setDayLogs] = useState<TensionLog[]>([]);

  const handleViewToggle = (days: 7 | 30) => {
    if (days === 30 && !isPremium) {
      setShowPremiumGate(true);
      return;
    }
    setViewDays(days);
  };

  const handleUpgrade = () => {
    purchasePremium();
    setShowPremiumGate(false);
    setViewDays(30);
  };

  const handleDayPress = (date: Date) => {
    const logsForDay = getLogsForDate(date);
    setDayLogs(logsForDay);
    setSelectedDate(date);
  };

  const closeModal = () => {
    setSelectedDate(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      </SafeAreaView>
    );
  }

  const currentLogs = logs.filter(log => {
    const cutoff = Date.now() - viewDays * 24 * 60 * 60 * 1000;
    return log.timestamp >= cutoff;
  });

  const previousLogs = logs.filter(log => {
    const cutoff = Date.now() - viewDays * 24 * 60 * 60 * 1000;
    const previousCutoff = cutoff - viewDays * 24 * 60 * 60 * 1000;
    return log.timestamp >= previousCutoff && log.timestamp < cutoff;
  });

  const tensionScore = calculateTensionScore(currentLogs);
  const previousScore = calculateTensionScore(previousLogs);
  const scoreChange = previousScore > 0 ? ((previousScore - tensionScore) / previousScore) * 100 : 0;

  const patterns = identifyPatterns(currentLogs);

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}${period}`;
  };

  const getTrendText = () => {
    if (currentLogs.length === 0) {
      return 'Start logging to see your trends';
    }
    if (previousLogs.length === 0) {
      return 'Keep logging to track your progress';
    }
    if (scoreChange > 0) {
      return `Your tension has decreased ${Math.abs(scoreChange).toFixed(0)}% this ${viewDays === 7 ? 'week' : 'month'}`;
    } else if (scoreChange < 0) {
      return `Your tension has increased ${Math.abs(scoreChange).toFixed(0)}% this ${viewDays === 7 ? 'week' : 'month'}`;
    } else {
      return `Your tension levels are stable this ${viewDays === 7 ? 'week' : 'month'}`;
    }
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Insights</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, viewDays === 7 && styles.toggleButtonActive]}
              onPress={() => handleViewToggle(7)}
            >
              <Text style={[styles.toggleText, viewDays === 7 && styles.toggleTextActive]}>
                7 Days
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, viewDays === 30 && styles.toggleButtonActive]}
              onPress={() => handleViewToggle(30)}
            >
              <Text style={[styles.toggleText, viewDays === 30 && styles.toggleTextActive]}>
                30 Days
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Tension Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tension Level:</Text>
            <Text style={styles.summaryValue}>
              {tensionScore > 0.7 ? 'High' : tensionScore > 0.4 ? 'Moderate' : 'Low'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Trend:</Text>
            <Text style={[
              styles.summaryValue,
              scoreChange > 0 && styles.positiveChange,
              scoreChange < 0 && styles.negativeChange
            ]}>
              {getTrendText()}
            </Text>
          </View>
        </View>

        <View style={styles.patternsCard}>
          <Text style={styles.patternsTitle}>Tension Patterns</Text>
          {patterns.peakHours.length > 0 && (
            <View style={styles.patternSection}>
              <Text style={styles.patternLabel}>Peak Tension Times:</Text>
              <View style={styles.patternTags}>
                {patterns.peakHours.map(hour => (
                  <View key={hour} style={styles.patternTag}>
                    <Text style={styles.patternTagText}>{formatHour(hour)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {patterns.peakDays.length > 0 && (
            <View style={styles.patternSection}>
              <Text style={styles.patternLabel}>Peak Tension Days:</Text>
              <View style={styles.patternTags}>
                {patterns.peakDays.map(day => {
                  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  return (
                    <View key={day} style={styles.patternTag}>
                      <Text style={styles.patternTagText}>{days[day]}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
          {patterns.peakHours.length === 0 && patterns.peakDays.length === 0 && (
            <Text style={styles.noPatternsText}>No patterns detected yet</Text>
          )}
        </View>

        <HeatmapCalendar
          logs={currentLogs}
          days={viewDays}
          onDayPress={handleDayPress}
        />

        {!isPremium && viewDays === 7 && (
          <View style={styles.premiumPrompt}>
            <Text style={styles.premiumPromptText}>
              Upgrade to Premium to see your full 30-day history and advanced pattern analysis
            </Text>
            <TouchableOpacity
              style={styles.premiumButton}
              onPress={() => setShowPremiumGate(true)}
            >
              <Text style={styles.premiumButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

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

      <PremiumGate
        visible={showPremiumGate}
        onClose={() => setShowPremiumGate(false)}
        onUpgrade={handleUpgrade}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  toggleButtonActive: {
    backgroundColor: Colors.light.tint,
  },
  toggleText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  toggleTextActive: {
    color: Colors.light.background,
    fontWeight: 'bold',
  },
  summaryCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
  positiveChange: {
    color: Colors.light.relaxed,
  },
  negativeChange: {
    color: Colors.light.tense,
  },
  patternsCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  patternsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
  },
  patternSection: {
    marginBottom: 12,
  },
  patternLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  patternTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  patternTag: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  patternTagText: {
    fontSize: 12,
    color: Colors.light.text,
  },
  noPatternsText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  premiumPrompt: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  premiumPromptText: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  premiumButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  premiumButtonText: {
    fontSize: 14,
    color: Colors.light.background,
    fontWeight: 'bold',
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
