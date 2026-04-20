import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Button, Card, Avatar, useTheme, ProgressBar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useEmailStore } from '../../store/email-store';
import { useUserStore } from '../../store/user-store';
import HealthScore from '../../components/HealthScore';

const DashboardScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useUserStore();
  const { senders, loadSenders, isLoading, scanInbox } = useEmailStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSenders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await scanInbox();
    await loadSenders();
    setRefreshing(false);
  };

  const topSenders = senders.slice(0, 3);
  const totalEmails = senders.reduce((sum, sender) => sum + sender.emailCount, 0);
  const promotionalEmails = senders.reduce((sum, sender) =>
    sender.classification === 'promotional' ? sum + sender.emailCount : sum, 0
  );

  const healthScore = totalEmails > 0
    ? Math.max(0, Math.min(100, 100 - (promotionalEmails / totalEmails * 100)))
    : 100;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Inbox Health
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
      </View>

      <View style={styles.scoreContainer}>
        <HealthScore score={healthScore} size={150} />
        <Text variant="headlineSmall" style={styles.scoreText}>
          {Math.round(healthScore)}%
        </Text>
        <Text variant="bodyMedium" style={styles.scoreLabel}>
          Inbox Health Score
        </Text>
      </View>

      <Card style={styles.statsCard}>
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="titleLarge" style={styles.statValue}>
                {totalEmails}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total Emails
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="titleLarge" style={styles.statValue}>
                {promotionalEmails}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Promotional
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="titleLarge" style={styles.statValue}>
                {totalEmails - promotionalEmails}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Important
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <ProgressBar
              progress={promotionalEmails / Math.max(1, totalEmails)}
              color={theme.colors.error}
              style={styles.progressBar}
            />
            <Text variant="bodySmall" style={styles.progressText}>
              {Math.round((promotionalEmails / Math.max(1, totalEmails)) * 100)}% promotional
            </Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium">Top Senders</Text>
          <Button
            mode="text"
            onPress={() => router.push('/(tabs)/scan')}
            textColor={theme.colors.primary}
          >
            View All
          </Button>
        </View>

        {topSenders.map(sender => (
          <Card key={sender.id} style={styles.senderCard}>
            <Card.Content style={styles.senderContent}>
              <Avatar.Text
                size={40}
                label={sender.domain.charAt(0).toUpperCase()}
                style={styles.senderAvatar}
              />
              <View style={styles.senderInfo}>
                <Text variant="bodyMedium" style={styles.senderName}>
                  {sender.name}
                </Text>
                <Text variant="bodySmall" style={styles.senderEmailCount}>
                  {sender.emailCount} emails
                </Text>
              </View>
              <View style={styles.senderTags}>
                {sender.tags.includes('unsubscribe-available') && (
                  <Text style={[styles.tag, styles.unsubscribeTag]}>Unsubscribe</Text>
                )}
                {sender.tags.includes('tracking') && (
                  <Text style={[styles.tag, styles.trackingTag]}>Tracking</Text>
                )}
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium">Quick Actions</Text>
        </View>

        <Button
          mode="contained"
          onPress={() => router.push('/(tabs)/scan')}
          style={styles.actionButton}
          contentStyle={styles.actionButtonContent}
        >
          Scan Inbox Now
        </Button>

        <Button
          mode="outlined"
          onPress={() => router.push('/(tabs)/insights')}
          style={[styles.actionButton, styles.secondaryActionButton]}
          contentStyle={styles.actionButtonContent}
        >
          View Insights
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'gray',
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  scoreText: {
    marginTop: -20,
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: 'gray',
    marginTop: 5,
  },
  statsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'gray',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    textAlign: 'right',
    marginTop: 5,
    color: 'gray',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  senderCard: {
    marginBottom: 10,
    borderRadius: 12,
    elevation: 1,
  },
  senderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  senderAvatar: {
    marginRight: 15,
  },
  senderInfo: {
    flex: 1,
  },
  senderName: {
    fontWeight: '500',
  },
  senderEmailCount: {
    color: 'gray',
  },
  senderTags: {
    flexDirection: 'row',
  },
  tag: {
    marginLeft: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: '500',
  },
  unsubscribeTag: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
  },
  trackingTag: {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
  },
  actionButton: {
    marginBottom: 10,
    paddingVertical: 8,
  },
  secondaryActionButton: {
    marginBottom: 20,
  },
  actionButtonContent: {
    height: 40,
  },
});

export default DashboardScreen;
