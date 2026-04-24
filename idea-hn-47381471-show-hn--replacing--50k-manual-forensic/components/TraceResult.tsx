import React from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { format } from 'date-fns';

const TraceResult = ({ result, startBalance, endBalance }) => {
  const renderTransaction = ({ item }) => {
    const isDeposit = item.amount > 0;
    return (
      <View style={styles.transactionRow}>
        <Text style={styles.transactionDate}>
          {format(new Date(item.date), 'MMM dd, yyyy')}
        </Text>
        <Text style={styles.transactionPayee}>{item.payee}</Text>
        <Text style={[styles.transactionAmount, isDeposit ? styles.deposit : styles.withdrawal]}>
          {isDeposit ? '+' : ''}${Math.abs(item.amount).toFixed(2)}
        </Text>
      </View>
    );
  };

  const renderGapIndicator = () => {
    if (result.explained) return null;

    return (
      <View style={styles.gapIndicatorContainer}>
        <View style={styles.gapLine} />
        <View style={styles.gapMarker}>
          <Text style={styles.gapText}>Missing Transactions</Text>
          <Text style={styles.gapAmount}>${Math.abs(result.gap).toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  const renderBalanceTimeline = () => {
    const totalWidth = Dimensions.get('window').width - 40;
    const totalChange = endBalance - startBalance;
    const percentageChange = totalChange / startBalance;

    return (
      <View style={styles.timelineContainer}>
        <View style={styles.timeline}>
          <View style={styles.balanceBarContainer}>
            <View style={[
              styles.balanceBar,
              {
                width: `${Math.abs(percentageChange) * 100}%`,
                backgroundColor: percentageChange >= 0 ? '#2ecc71' : '#e74c3c'
              }
            ]} />
          </View>
          <View style={styles.balanceLabels}>
            <Text style={styles.balanceLabel}>${startBalance.toFixed(2)}</Text>
            <Text style={styles.balanceLabel}>${endBalance.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>
          {result.explained ? 'Balance Explained' : 'Gap Detected'}
        </Text>
        <Text style={styles.summaryBalance}>
          Start: ${startBalance.toFixed(2)} → End: ${endBalance.toFixed(2)}
        </Text>
        {result.explained ? (
          <Text style={styles.successText}>
            All transactions account for the balance change.
          </Text>
        ) : (
          <Text style={styles.warningText}>
            Unexplained gap of ${Math.abs(result.gap).toFixed(2)} detected.
          </Text>
        )}
      </View>

      {renderBalanceTimeline()}

      <Text style={styles.sectionTitle}>Transaction Timeline</Text>
      <FlatList
        data={result.timeline}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        style={styles.transactionList}
        ListFooterComponent={renderGapIndicator}
      />

      <View style={styles.calculationExplanation}>
        <Text style={styles.explanationTitle}>How the Balance Was Calculated:</Text>
        <Text style={styles.explanationText}>
          Starting balance: ${startBalance.toFixed(2)}
        </Text>
        {result.timeline.map((tx, index) => (
          <Text key={index} style={styles.explanationText}>
            {tx.payee}: {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
          </Text>
        ))}
        <Text style={styles.explanationText}>
          Final calculated balance: ${(startBalance + result.timeline.reduce((sum, tx) => sum + tx.amount, 0)).toFixed(2)}
        </Text>
        <Text style={styles.explanationText}>
          Ending balance: ${endBalance.toFixed(2)}
        </Text>
        {!result.explained && (
          <Text style={[styles.explanationText, styles.gapExplanation]}>
            Gap: ${Math.abs(result.gap).toFixed(2)} (missing transactions)
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summary: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
  },
  summaryBalance: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  successText: {
    color: '#2ecc71',
    fontSize: 16,
    fontWeight: '600',
  },
  warningText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  transactionList: {
    maxHeight: 300,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
    width: 100,
  },
  transactionPayee: {
    fontSize: 16,
    flex: 1,
    marginHorizontal: 10,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    width: 80,
    textAlign: 'right',
  },
  deposit: {
    color: '#2ecc71',
  },
  withdrawal: {
    color: '#e74c3c',
  },
  gapIndicatorContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  gapLine: {
    height: 2,
    backgroundColor: '#e74c3c',
    width: '100%',
    marginBottom: 10,
  },
  gapMarker: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  gapText: {
    color: 'white',
    fontWeight: '600',
  },
  gapAmount: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  timelineContainer: {
    marginBottom: 20,
  },
  timeline: {
    marginTop: 10,
  },
  balanceBarContainer: {
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  balanceBar: {
    height: '100%',
  },
  balanceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  calculationExplanation: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  explanationText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#444',
  },
  gapExplanation: {
    color: '#e74c3c',
    fontWeight: '600',
  },
});

export default TraceResult;
