import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useGoals } from '../../hooks/useGoals';
import GoalCard from '../../components/GoalCard';
import { SubscriptionContext } from '../../context/SubscriptionContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const GoalsScreen = () => {
  const { goals, addGoal } = useGoals();
  const { isPremium } = useContext(SubscriptionContext);
  const navigation = useNavigation();
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);

  const handleAddGoal = () => {
    if (!newGoalTitle.trim()) return;

    if (!isPremium && goals.length >= 1) {
      setShowPaywall(true);
      return;
    }

    addGoal(newGoalTitle);
    setNewGoalTitle('');
  };

  const handleUpgradePress = () => {
    setShowPaywall(true);
  };

  const handlePurchase = async () => {
    // In a real app, you would call the purchase function from your subscription service
    // For this prototype, we'll just simulate a successful purchase
    setTimeout(() => {
      setShowPaywall(false);
      // In a real app, you would update the subscription status here
    }, 1000);
  };

  const handleNavigateToSettings = () => {
    setShowPaywall(false);
    navigation.navigate('settings');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Goals</Text>

      <View style={styles.addGoalContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new goal..."
          value={newGoalTitle}
          onChangeText={setNewGoalTitle}
          onSubmitEditing={handleAddGoal}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddGoal}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {!isPremium && goals.length >= 1 && (
        <View style={styles.premiumNotice}>
          <Ionicons name="lock-closed" size={16} color="#FFD700" />
          <Text style={styles.premiumNoticeText}>Premium lets you add up to 5 goals</Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUpgradePress}
          >
            <Text style={styles.upgradeButtonText}>Upgrade</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <GoalCard
            goal={item}
            index={index}
            onUpgradePress={handleUpgradePress}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You don't have any goals yet. Add one to get started!</Text>
          </View>
        }
      />

      <Modal
        visible={showPaywall}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaywall(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Unlock More Goals</Text>

            <View style={styles.featureComparison}>
              <View style={styles.featureRow}>
                <Text style={styles.featureText}>Free</Text>
                <Text style={styles.featureText}>Premium</Text>
              </View>

              <View style={styles.featureRow}>
                <Text style={styles.featureText}>1 goal</Text>
                <Text style={styles.featureText}>5 goals</Text>
              </View>

              <View style={styles.featureRow}>
                <Text style={styles.featureText}>Basic scheduling</Text>
                <Text style={styles.featureText}>Advanced scheduling</Text>
              </View>

              <View style={styles.featureRow}>
                <Text style={styles.featureText}>Standard prompts</Text>
                <Text style={styles.featureText}>Personalized TTS</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.purchaseButton}
              onPress={handlePurchase}
            >
              <Text style={styles.purchaseButtonText}>Upgrade to Premium - $7.99/month</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleNavigateToSettings}
            >
              <Text style={styles.closeButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  addGoalContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#673ab7',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  premiumNoticeText: {
    flex: 1,
    marginLeft: 8,
    color: '#666',
  },
  upgradeButton: {
    backgroundColor: '#673ab7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  featureComparison: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
  },
  purchaseButton: {
    backgroundColor: '#673ab7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    padding: 12,
  },
  closeButtonText: {
    color: '#673ab7',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default GoalsScreen;
