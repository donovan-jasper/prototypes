import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Button, Card, Divider } from 'react-native-paper';

const PaymentSplitView = ({ order, splitType = 'equal', customRules = [], onPay }) => {
  const calculateSplit = (order, splitType, customRules) => {
    const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = total * 0.08;
    const tip = total * 0.15;
    const deliveryFee = 5.00;
    const grandTotal = total + tax + tip + deliveryFee;

    if (splitType === 'equal') {
      const perPerson = grandTotal / order.participants.length;
      return {
        total: grandTotal,
        perPerson,
        participants: order.participants.map(participant => ({
          ...participant,
          amount: perPerson,
        })),
      };
    } else if (splitType === 'custom' && customRules.length > 0) {
      // Initialize participant amounts
      const participantAmounts = order.participants.reduce((acc, participant) => {
        acc[participant.id] = 0;
        return acc;
      }, {});

      // Process item-based rules first
      const itemRules = customRules.filter(rule => rule.items);
      const processedItems = new Set();

      itemRules.forEach(rule => {
        rule.items.forEach(itemName => {
          const matchingItems = order.items.filter(item =>
            item.name.toLowerCase().includes(itemName.toLowerCase()) &&
            !processedItems.has(item.id)
          );

          matchingItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            participantAmounts[rule.participantId] += itemTotal;
            processedItems.add(item.id);
          });
        });
      });

      // Process percentage rules
      const percentageRules = customRules.filter(rule => rule.percentage);
      const remainingTotal = grandTotal - Object.values(participantAmounts).reduce((sum, amount) => sum + amount, 0);

      percentageRules.forEach(rule => {
        participantAmounts[rule.participantId] += remainingTotal * rule.percentage;
      });

      // Distribute remaining amount equally among participants not covered by rules
      const coveredParticipants = new Set([
        ...itemRules.map(rule => rule.participantId),
        ...percentageRules.map(rule => rule.participantId)
      ]);

      const uncoveredParticipants = order.participants.filter(p => !coveredParticipants.has(p.id));
      const remainingAmount = grandTotal - Object.values(participantAmounts).reduce((sum, amount) => sum + amount, 0);

      if (uncoveredParticipants.length > 0) {
        const perPersonRemaining = remainingAmount / uncoveredParticipants.length;
        uncoveredParticipants.forEach(participant => {
          participantAmounts[participant.id] += perPersonRemaining;
        });
      }

      return {
        total: grandTotal,
        perPerson: grandTotal / order.participants.length,
        participants: order.participants.map(participant => ({
          ...participant,
          amount: participantAmounts[participant.id],
        })),
      };
    }

    return null;
  };

  const split = calculateSplit(order, splitType, customRules);

  const renderParticipantItem = ({ item }) => (
    <View style={styles.participantRow}>
      <Text style={styles.participantName}>{item.name}</Text>
      <Text style={styles.participantAmount}>${item.amount.toFixed(2)}</Text>
    </View>
  );

  return (
    <Card style={styles.container}>
      <Card.Title title="Payment Split" subtitle={`Total: $${split.total.toFixed(2)}`} />
      <Card.Content>
        <FlatList
          data={split.participants}
          renderItem={renderParticipantItem}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <Divider />}
        />
        <View style={styles.summary}>
          <Text style={styles.summaryText}>Your share: ${split.participants.find(p => p.isCurrentUser)?.amount.toFixed(2) || '0.00'}</Text>
          <Button
            mode="contained"
            onPress={onPay}
            style={styles.payButton}
          >
            Pay Now
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  participantName: {
    fontSize: 16,
  },
  participantAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summaryText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  payButton: {
    marginTop: 8,
  },
});

export default PaymentSplitView;
