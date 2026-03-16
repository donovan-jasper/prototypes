import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useStore } from '../../store/useStore';
import PodCard from '../../components/PodCard';
import PremiumGate from '../../components/PremiumGate';

export default function PodsScreen() {
  const { userPods, isPremium } = useStore();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [podCode, setPodCode] = useState('');

  const handleCreatePod = () => {
    if (!isPremium && userPods.length >= 1) {
      setShowPremiumModal(true);
    } else {
      // Logic to create a new pod
    }
  };

  const handleJoinPod = () => {
    // Logic to join a pod using podCode
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Accountability Pods</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreatePod}>
          <Text style={styles.createButtonText}>Create Pod</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.joinContainer}>
        <TextInput
          style={styles.joinInput}
          placeholder="Enter pod code"
          value={podCode}
          onChangeText={setPodCode}
        />
        <TouchableOpacity style={styles.joinButton} onPress={handleJoinPod}>
          <Text style={styles.joinButtonText}>Join</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={userPods}
        renderItem={({ item }) => <PodCard pod={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />

      <PremiumGate
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        feature="multiple pods"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  createButton: {
    backgroundColor: '#6c5ce7',
    padding: 10,
    borderRadius: 5,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  joinContainer: {
    flexDirection: 'row',
    padding: 15,
  },
  joinInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#b2bec3',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  joinButton: {
    backgroundColor: '#6c5ce7',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  list: {
    padding: 15,
  },
});
