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

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Tension Overview</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Current Score:</Text>
            <Text style={styles.summaryValue}>
              {currentLogs.length > 0 ? `${(tensionScore * 100).toFixed(0)}% tense` : 'No data'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Trend:</Text>
            <Text style={styles.summaryValue}>{getTrendText()}</Text>
          </View>
        </View>

        {patterns.peakHours.length > 0 && (
          <View style={styles.patternCard}>
            <Text style={styles.patternTitle}>Tension Patterns</Text>
            <View style={styles.patternSection}>
              <Text style={styles.patternSectionTitle}>Peak Tension Times:</Text>
              <View style={styles.patternTags}>
                {patterns.peakHours.map(hour => (
                  <View key={hour} style={styles.patternTag}>
                    <Text style={styles.patternTagText}>{formatHour(hour)}</Text>
                  </View>
                ))}
              </View>
            </View>
            {patterns.peakDays.length > 0 && (
              <View style={styles.patternSection}>
                <Text style={styles.patternSectionTitle}>Peak Tension Days:</Text>
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
        )}

        <HeatmapCalendar
          logs={currentLogs}
          days={viewDays}
          onDayPress={handleDayPress}
        />

        {!isPremium && viewDays === 7 && (
          <PremiumGate
            title="Unlock 30-Day History"
            description="See your full month of tension patterns and track your progress over time."
            buttonText="Upgrade to Premium"
            onPress={purchasePremium}
          />
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
                  year: 'numeric',
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
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No tension logs for this day</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPremiumGate}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPremiumGate(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Premium Feature</Text>
              <TouchableOpacity onPress={() => setShowPremiumGate(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.premiumContent}>
              <Text style={styles.premiumTitle}>Unlock 30-Day History</Text>
              <Text style={styles.premiumDescription}>
                See your full month of tension patterns and track your progress over time.
              </Text>

              <View style={styles.premiumBenefits}>
                <Text style={styles.premiumBenefit}>• Full 30-day heatmap</Text>
                <Text style={styles.premiumBenefit}>• Long-term trend analysis</Text>
                <Text style={styles.premiumBenefit}>• Unlimited reminders</Text>
                <Text style={styles.premiumBenefit}>• All body zones</Text>
              </View>

              <TouchableOpacity
                style={styles.premiumButton}
                onPress={handleUpgrade}
              >
                <Text style={styles.premiumButtonText}>Upgrade to Premium</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontWeight: '700',
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
    fontSize: 16,
    color: Colors.light.text,
  },
  toggleTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  patternCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  patternTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  patternSection: {
    marginBottom: 12,
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
  },
  patternTag: {
    backgroundColor: Colors.light.tint,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  patternTagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
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
    fontWeight: '600',
    color: Colors.light.text,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: Colors.light.tint,
    fontSize: 16,
    fontWeight: '500',
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
    fontWeight: '500',
  },
  logStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  premiumContent: {
    padding: 16,
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  premiumDescription: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  premiumBenefits: {
    marginBottom: 24,
  },
  premiumBenefit: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 8,
  },
  premiumButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  premiumButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
