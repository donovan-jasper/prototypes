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

        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Tension Level</Text>
            <Text style={styles.summaryValue}>
              {currentLogs.length > 0
                ? `${Math.round(tensionScore * 100)}%`
                : 'No data'}
            </Text>
            <Text style={styles.summaryTrend}>
              {getTrendText()}
            </Text>
          </View>

          {patterns.peakHours.length > 0 && (
            <View style={styles.patternCard}>
              <Text style={styles.patternTitle}>Peak Tension Times</Text>
              <View style={styles.patternTags}>
                {patterns.peakHours.map(hour => (
                  <View key={hour} style={styles.patternTag}>
                    <Text style={styles.patternTagText}>{formatHour(hour)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <HeatmapCalendar
          logs={currentLogs}
          days={viewDays}
          onDayPress={handleDayPress}
        />

        {!isPremium && viewDays === 7 && (
          <PremiumGate
            title="Unlock 30-Day View"
            description="See your full month of tension patterns with JawZen Premium"
            buttonText="Upgrade Now"
            onPress={handleUpgrade}
            style={styles.premiumGate}
          />
        )}
      </ScrollView>

      <Modal
        visible={selectedDate !== null}
        transparent={true}
        animationType="slide"
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
                keyExtractor={(item, index) => `${item.id}-${index}`}
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

      <Modal
        visible={showPremiumGate}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPremiumGate(false)}
      >
        <View style={styles.premiumModalContainer}>
          <View style={styles.premiumModalContent}>
            <Text style={styles.premiumModalTitle}>Upgrade to Premium</Text>
            <Text style={styles.premiumModalDescription}>
              Unlock the 30-day view to see your full month of tension patterns and get deeper insights into your stress triggers.
            </Text>
            <View style={styles.premiumBenefits}>
              <Text style={styles.premiumBenefit}>• Full month of tension history</Text>
              <Text style={styles.premiumBenefit}>• Advanced pattern analysis</Text>
              <Text style={styles.premiumBenefit}>• All body zone tracking</Text>
              <Text style={styles.premiumBenefit}>• Unlimited reminders</Text>
            </View>
            <View style={styles.premiumButtons}>
              <TouchableOpacity
                style={[styles.premiumButton, styles.premiumButtonSecondary]}
                onPress={() => setShowPremiumGate(false)}
              >
                <Text style={styles.premiumButtonText}>Maybe Later</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.premiumButton, styles.premiumButtonPrimary]}
                onPress={handleUpgrade}
              >
                <Text style={[styles.premiumButtonText, styles.premiumButtonPrimaryText]}>Upgrade Now</Text>
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
    marginBottom: 12,
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
  summaryContainer: {
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  summaryTrend: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  patternCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
  },
  patternTitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  patternTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  patternTag: {
    backgroundColor: Colors.light.tint + '20',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  patternTagText: {
    fontSize: 14,
    color: Colors.light.tint,
  },
  premiumGate: {
    marginTop: 24,
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
    color: Colors.light.tint,
    fontWeight: 'bold',
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
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  premiumModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  premiumModalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  premiumModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  premiumModalDescription: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 20,
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
  premiumButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  premiumButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  premiumButtonSecondary: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  premiumButtonPrimary: {
    backgroundColor: Colors.light.tint,
  },
  premiumButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  premiumButtonPrimaryText: {
    color: Colors.light.background,
  },
});
