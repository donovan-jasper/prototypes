import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TensionButton from '@/components/TensionButton';
import { useTensionLog } from '@/hooks/useTensionLog';
import { TensionStatus, TensionLog } from '@/types';
import { Colors } from '@/constants/colors';

export default function HomeScreen() {
  const { recentLogs, loading, logTension } = useTensionLog();
  const [currentStatus, setCurrentStatus] = useState<TensionStatus>('tense');

  const handleTensionLog = async () => {
    try {
      await logTension('jaw', currentStatus);
      setCurrentStatus(currentStatus === 'tense' ? 'relaxed' : 'tense');
    } catch (error) {
      console.error('Failed to log tension:', error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  const renderLogItem = ({ item }: { item: TensionLog }) => {
    const isTense = item.status === 'tense';
    const statusColor = isTense ? Colors.light.tense : Colors.light.relaxed;
    
    return (
      <View style={styles.logItem}>
        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
        <View style={styles.logContent}>
          <Text style={styles.logStatus}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
          <Text style={styles.logTime}>{formatTimestamp(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </SafeAreaView>
    );
  }

  const lastLogTime = recentLogs.length > 0 ? recentLogs[0].timestamp : undefined;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>How are you feeling?</Text>
        <Text style={styles.subtitle}>Tap to log your current state</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TensionButton
          status={currentStatus}
          onPress={handleTensionLog}
          lastLogTime={lastLogTime}
        />
      </View>

      <View style={styles.logsSection}>
        <Text style={styles.logsTitle}>Recent Logs</Text>
        {recentLogs.length === 0 ? (
          <Text style={styles.emptyText}>No logs yet. Start tracking your tension!</Text>
        ) : (
          <FlatList
            data={recentLogs}
            renderItem={renderLogItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.icon,
  },
  buttonContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  logsSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  logsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  logContent: {
    flex: 1,
  },
  logStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  logTime: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.icon,
    textAlign: 'center',
    marginTop: 32,
  },
});
