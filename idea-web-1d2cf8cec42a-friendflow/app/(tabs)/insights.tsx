import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useContactStore } from '../../store/contactStore';
import { getMonthlyCheckIns, getTopContactsByScore, getImprovementScore } from '../../lib/analytics';
import { Contact, Interaction } from '../../types';
import { format } from 'date-fns';
import { Card, ProgressBar, Title, Subheading, Divider } from 'react-native-paper';
import InsightChart from '../../components/InsightChart';

const InsightsScreen = () => {
  const { contacts, interactions } = useContactStore();
  const [monthlyData, setMonthlyData] = useState<Record<string, number>>({});
  const [topContacts, setTopContacts] = useState<Contact[]>([]);
  const [improvementScore, setImprovementScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentDate = new Date();

    // Prepare interactions map for score calculation
    const interactionsMap: Record<string, Interaction[]> = {};
    interactions.forEach(interaction => {
      if (!interactionsMap[interaction.contactId]) {
        interactionsMap[interaction.contactId] = [];
      }
      interactionsMap[interaction.contactId].push(interaction);
    });

    // Calculate monthly check-ins
    const monthlyCheckIns = getMonthlyCheckIns(interactions, currentDate);
    setMonthlyData(monthlyCheckIns);

    // Get top 3 contacts by score
    const topContacts = getTopContactsByScore(contacts, interactionsMap, currentDate);
    setTopContacts(topContacts);

    // Calculate improvement score
    const improvement = getImprovementScore(interactions, currentDate);
    setImprovementScore(improvement);

    setLoading(false);
  }, [contacts, interactions]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Loading insights...</Text>
      </View>
    );
  }

  // Prepare data for bar chart
  const chartData = {
    labels: Object.keys(monthlyData).map(month => {
      const [year, monthNum] = month.split('-');
      return format(new Date(Number(year), Number(monthNum) - 1), 'MMM yy');
    }),
    datasets: [
      {
        data: Object.values(monthlyData),
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.pageTitle}>Your Relationship Insights</Title>

      <InsightChart
        data={chartData}
        title="Monthly Check-in Frequency"
        yAxisSuffix=" interactions"
      />

      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Top Relationships</Title>
          {topContacts.length > 0 ? (
            topContacts.map((contact, index) => (
              <View key={contact.id}>
                <View style={styles.contactCard}>
                  <View style={styles.contactHeader}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactScore}>{contact.score?.toFixed(0) || 'N/A'}</Text>
                  </View>
                  <ProgressBar
                    progress={((contact.score || 0) / 100)}
                    color={contact.score && contact.score > 70 ? '#4CAF50' : contact.score && contact.score > 40 ? '#FFC107' : '#F44336'}
                    style={styles.progressBar}
                  />
                  <Subheading style={styles.contactFrequency}>
                    Check-in frequency: every {contact.frequency} days
                  </Subheading>
                </View>
                {index < topContacts.length - 1 && <Divider style={styles.divider} />}
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No relationship data yet. Add some contacts and interactions to see insights!</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Your Improvement</Title>
          <View style={styles.improvementHeader}>
            <Text style={styles.improvementLabel}>Last 30 Days</Text>
            <Text style={styles.improvementScore}>{improvementScore.toFixed(0)}%</Text>
          </View>
          <ProgressBar
            progress={improvementScore / 100}
            color={improvementScore > 50 ? '#4CAF50' : improvementScore > 30 ? '#FFC107' : '#F44336'}
            style={styles.progressBar}
          />
          <Subheading style={styles.improvementText}>
            {improvementScore > 50
              ? 'Great job! You\'re improving your relationship maintenance.'
              : improvementScore > 30
                ? 'You\'re making progress. Keep it up!'
                : 'Let\'s work on maintaining more consistent contact.'}
          </Subheading>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  pageTitle: {
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 24,
  },
  sectionCard: {
    marginBottom: 24,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  contactCard: {
    paddingVertical: 12,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  contactFrequency: {
    marginTop: 8,
    color: '#666',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 16,
  },
  improvementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  improvementLabel: {
    fontSize: 16,
    color: '#666',
  },
  improvementScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  improvementText: {
    marginTop: 16,
    color: '#666',
  },
  divider: {
    marginVertical: 12,
  },
});

export default InsightsScreen;
