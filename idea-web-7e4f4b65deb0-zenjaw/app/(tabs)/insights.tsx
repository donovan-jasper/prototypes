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
  const { logs, loading, calculateTensionScore, identifyPatterns } = useTensionLog();
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

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Tension Summary</Text>
          <View style={styles.summaryStats}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{(tensionScore * 100).toFixed(0)}%</Text>
              <Text style={styles.statLabel}>Tense</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{((1 - tensionScore) * 100).toFixed(0)}%</Text>
              <Text style={styles.statLabel}>Relaxed</Text>
            </View>
          </View>
          <Text style={styles.trendText}>{getTrendText()}</Text>
        </View>

        <View style={styles.patternsContainer}>
          <Text style={styles.patternsTitle}>Tension Patterns</Text>
          {patterns.peakHours.length > 0 && (
            <View style={styles.patternSection}>
              <Text style={styles.patternSectionTitle}>Peak Tension Times</Text>
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
              <Text style={styles.patternSectionTitle}>Peak Tension Days</Text>
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
        </View>

        <View style={styles.heatmapContainer}>
          <HeatmapCalendar
            logs={currentLogs}
            days={viewDays}
            onDayPress={handleDayPress}
          />
        </View>

        {!isPremium && (
          <View style={styles.premiumBanner}>
            <Text style={styles.premiumText}>Unlock 30-day history with Premium</Text>
            <TouchableOpacity
              style={styles.premiumButton}
              onPress={() => purchasePremium()}
            >
              <Text style={styles.premiumButtonText}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={!!selectedDate}
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
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {dayLogs.length > 0 ? (
              <FlatList
                data={dayLogs.sort((a, b) => b.timestamp - a.timestamp)}
                renderItem={renderDayLogItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.logList}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No tension logs for this day</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: Colors.light.text,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: Colors.light.background,
  },
  summaryContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  trendText: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
  },
  patternsContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  patternsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  patternSection: {
    marginBottom: 16,
  },
  patternSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  patternTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  patternTag: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  patternTagText: {
    color: Colors.light.text,
    fontSize: 14,
  },
  heatmapContainer: {
    marginBottom: 24,
  },
  premiumBanner: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  premiumText: {
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
  premiumButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  premiumButtonText: {
    color: Colors.light.background,
    fontWeight: '600',
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
    fontSize: 24,
    color: Colors.light.text,
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
    fontSize: 14,
    color: Colors.light.textSecondary,
    textTransform: 'capitalize',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
});
