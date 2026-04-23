import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SubscriptionContext } from '../context/SubscriptionContext';

interface PremiumGateProps {
  feature: string;
  children: React.ReactNode;
  renderLocked?: () => React.ReactNode;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({ feature, children, renderLocked }) => {
  const { isFeatureUnlocked } = useContext(SubscriptionContext);

  if (isFeatureUnlocked(feature)) {
    return <>{children}</>;
  }

  if (renderLocked) {
    return renderLocked();
  }

  return (
    <View style={styles.lockedContainer}>
      <Text style={styles.lockedText}>Premium Feature</Text>
      <TouchableOpacity style={styles.upgradeButton}>
        <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
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
    marginVertical: 16,
  },
  lockedText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  upgradeButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  upgradeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
