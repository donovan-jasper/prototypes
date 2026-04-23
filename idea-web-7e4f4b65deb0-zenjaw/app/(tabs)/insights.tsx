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

        <HeatmapCalendar
          logs={currentLogs}
          days={viewDays}
          onDayPress={handleDayPress}
        />

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Tension Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tension Level:</Text>
            <Text style={styles.summaryValue}>
              {currentLogs.length === 0 ? 'No data' : `${(tensionScore * 100).toFixed(0)}% tense`}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Trend:</Text>
            <Text style={styles.summaryValue}>{getTrendText()}</Text>
          </View>
          {patterns.peakHours.length > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Peak Tension Times:</Text>
              <Text style={styles.summaryValue}>
                {patterns.peakHours.map(hour => formatHour(hour)).join(', ')}
              </Text>
            </View>
          )}
        </View>

        {!isPremium && (
          <PremiumGate
            title="Unlock Full History"
            description="See your complete 30-day tension patterns and get deeper insights with JawZen Premium."
            buttonText="Upgrade Now"
            onPress={handleUpgrade}
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
            <Text style={styles.modalTitle}>
              {selectedDate?.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>

            {dayLogs.length > 0 ? (
              <FlatList
                data={dayLogs}
                renderItem={renderDayLogItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.logList}
              />
            ) : (
              <Text style={styles.noLogsText}>No tension logs for this day</Text>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeModal}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPremiumGate}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowPremiumGate(false)}
      >
        <View style={styles.premiumModalContainer}>
          <View style={styles.premiumModalContent}>
            <Text style={styles.premiumModalTitle}>Premium Feature</Text>
            <Text style={styles.premiumModalText}>
              The 30-day view is available to Premium members only.
            </Text>
            <View style={styles.premiumModalButtons}>
              <TouchableOpacity
                style={[styles.premiumModalButton, styles.premiumModalCancel]}
                onPress={() => setShowPremiumGate(false)}
              >
                <Text style={styles.premiumModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.premiumModalButton, styles.premiumModalUpgrade]}
                onPress={handleUpgrade}
              >
                <Text style={[styles.premiumModalButtonText, styles.premiumModalUpgradeText]}>
                  Upgrade Now
                </Text>
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
    justifyContent: 'center',
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  toggleButtonActive: {
    backgroundColor: Colors.light.tint,
  },
  toggleText: {
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  logList: {
    marginBottom: 16,
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
  noLogsText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginVertical: 20,
  },
  closeButton: {
    backgroundColor: Colors.light.tint,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  premiumModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  premiumModalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    width: '85%',
    padding: 20,
  },
  premiumModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  premiumModalText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  premiumModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  premiumModalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  premiumModalCancel: {
    backgroundColor: Colors.light.backgroundSecondary,
  },
  premiumModalUpgrade: {
    backgroundColor: Colors.light.tint,
  },
  premiumModalButtonText: {
    fontWeight: '600',
  },
  premiumModalUpgradeText: {
    color: '#fff',
  },
});
