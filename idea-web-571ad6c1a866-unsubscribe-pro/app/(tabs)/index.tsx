import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useEmailScan } from '../../hooks/useEmailScan';
import { useHealthScore } from '../../hooks/useHealthScore';
import HealthScore from '../../components/HealthScore';
import EmailCard from '../../components/EmailCard';
import UnsubscribeButton from '../../components/UnsubscribeButton';
import { useUserStore } from '../../store/user-store';

export default function DashboardScreen() {
  const { isScanning, scanInbox, senders } = useEmailScan();
  const { score, timeSaved, streak } = useHealthScore();
  const { isPro } = useUserStore();

  const topSenders = senders.slice(0, 5);
  const subscriptionSenders = senders.filter(sender =>
    sender.tags?.includes('subscription') || sender.tags?.includes('subscription-service')
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>InboxZen</Text>
        <Text style={styles.subtitle}>Your email health score</Text>
        <HealthScore score={score} />
        <Text style={styles.stats}>
          {timeSaved} hours saved this week • {streak} day streak
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Clutter Sources</Text>
        {topSenders.map((sender) => (
          <EmailCard
            key={sender.id}
            sender={sender}
            isPro={isPro}
          />
        ))}
        <UnsubscribeButton
          title="Scan Full Inbox"
          onPress={scanInbox}
          loading={isScanning}
          disabled={isScanning}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Recommendations</Text>
        <Text style={styles.recommendation}>
          {isPro
            ? "Your AI is analyzing your inbox for better categorization"
            : "Upgrade to Pro for AI-powered email classification"}
        </Text>
        {!isPro && (
          <UnsubscribeButton
            title="Upgrade to Pro"
            onPress={() => {}}
            style={styles.upgradeButton}
          />
        )}
      </View>

      {isPro && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Spending Tracker</Text>
          <Text style={styles.recommendation}>
            We've identified {subscriptionSenders.length} subscription services you're paying for via email receipts
          </Text>
          <UnsubscribeButton
            title="View All Subscriptions"
            onPress={() => {}}
            style={styles.subscriptionButton}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  stats: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  recommendation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  upgradeButton: {
    backgroundColor: '#4CAF50',
  },
  subscriptionButton: {
    backgroundColor: '#2196F3',
  },
});
