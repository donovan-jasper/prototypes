import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useContactStore } from '../../store/contactStore';
import { getMonthlyCheckIns, getTopContactsByScore, getImprovementScore } from '../../lib/analytics';
import { Contact, Interaction } from '../../types';
import { format } from 'date-fns';
import { Card, ProgressBar, Title, Subheading } from 'react-native-paper';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

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
      <View style={styles.container}>
        <Text>Loading insights...</Text>
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
      <Title style={styles.sectionTitle}>Monthly Check-in Frequency</Title>
      <Card style={styles.chartCard}>
        <BarChart
          data={chartData}
          width={screenWidth - 32}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(66, 133, 244, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#ffa726',
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
          verticalLabelRotation={30}
        />
      </Card>

      <Title style={styles.sectionTitle}>Top Relationships</Title>
      {topContacts.length > 0 ? (
        topContacts.map((contact, index) => (
          <Card key={contact.id} style={styles.contactCard}>
            <Card.Content>
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
            </Card.Content>
          </Card>
        ))
      ) : (
        <Text style={styles.noDataText}>No relationship data yet. Add some contacts and interactions to see insights!</Text>
      )}

      <Title style={styles.sectionTitle}>Your Improvement</Title>
      <Card style={styles.improvementCard}>
        <Card.Content>
          <View style={styles.improvementHeader}>
            <Text style={styles.improvementLabel}>Last 30 Days</Text>
            <Text style={styles.improvementScore}>{improvementScore.toFixed(0)}%</Text>
          </View>
          <ProgressBar
            progress={improvementScore / 100}
            color={improvementScore > 50 ? '#4CAF50' : improvementScore > 30 ? '#FFC107' : '#F44336'}
            style={styles.progressBar}
          />
          <Text style={styles.improvementText}>
            {improvementScore > 50
              ? 'Great job! You\'re improving your relationship maintenance.'
              : improvementScore > 30
              ? 'You\'re making progress. Keep it up!'
              : 'Let\'s work on building more consistent connections.'}
          </Text>
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
  sectionTitle: {
    marginTop: 24,
    marginBottom: 16,
    fontSize: 20,
    fontWeight: 'bold',
  },
  chartCard: {
    marginBottom: 24,
    padding: 8,
    elevation: 2,
  },
  contactCard: {
    marginBottom: 16,
    elevation: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  contactFrequency: {
    marginTop: 8,
    color: '#666',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
  improvementCard: {
    marginBottom: 24,
    elevation: 2,
  },
  improvementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  improvementLabel: {
    fontSize: 16,
    color: '#666',
  },
  improvementScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  improvementText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 16,
  },
});

export default InsightsScreen;
