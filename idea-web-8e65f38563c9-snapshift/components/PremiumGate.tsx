import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SubscriptionContext } from '../context/SubscriptionContext';
import { Ionicons } from '@expo/vector-icons';

interface PremiumGateProps {
  feature: 'unlimitedPrompts' | 'fullLibrary' | 'multipleGoals';
  children: React.ReactNode;
  renderLocked?: () => React.ReactNode;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({ feature, children, renderLocked }) => {
  const { isPremium, isFeatureUnlocked } = useContext(SubscriptionContext);

  if (isPremium || isFeatureUnlocked(feature)) {
    return <>{children}</>;
  }

  if (renderLocked) {
    return <>{renderLocked()}</>;
  }

  return (
    <View style={styles.lockedContainer}>
      <Ionicons name="lock-closed" size={24} color="#FFD700" />
      <Text style={styles.lockedText}>Premium Feature</Text>
      <TouchableOpacity style={styles.upgradeButton}>
        <Text style={styles.upgradeButtonText}>Upgrade to Unlock</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  lockedContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  lockedText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  upgradeButton: {
    backgroundColor: '#673ab7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  upgradeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
