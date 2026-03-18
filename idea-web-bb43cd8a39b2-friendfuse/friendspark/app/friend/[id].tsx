import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useFriend } from '../../hooks/useFriend';
import StreakBadge from '../../components/StreakBadge';
import ConnectionTimeline from '../../components/ConnectionTimeline';
import { getAvailableChallenges } from '../../constants/challenges';
import { startChallenge } from '../../lib/challenges';

export default function FriendDetailScreen() {
  const { id } = useLocalSearchParams();
  const { friend, streak, interactions, logInteraction } = useFriend(id);
  const [modalVisible, setModalVisible] = useState(false);
  const [availableChallenges, setAvailableChallenges] = useState([]);

  if (!friend) {
    return (
      <View style={styles.container}>
        <Text>Friend not found</Text>
      </View>
    );
  }

  const handleStartChallenge = async () => {
    const challenges = getAvailableChallenges('free', streak?.current || 0);
    setAvailableChallenges(challenges);
    setModalVisible(true);
  };

  const handleSelectChallenge = async (challenge) => {
    await startChallenge(parseInt(id), challenge.title);
    setModalVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{friend.name}</Text>
        <StreakBadge streak={streak} />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => logInteraction('text')}
        >
          <Text style={styles.actionText}>Log Text</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => logInteraction('call')}
        >
          <Text style={styles.actionText}>Log Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => logInteraction('hangout')}
        >
          <Text style={styles.actionText}>Log Hangout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.challengeSection}>
        <TouchableOpacity
          style={styles.startChallengeButton}
          onPress={handleStartChallenge}
        >
          <Text style={styles.startChallengeText}>Start Challenge</Text>
        </TouchableOpacity>
      </View>

      <ConnectionTimeline interactions={interactions} />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Available Challenges</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={availableChallenges}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.challengeItem}
                  onPress={() => handleSelectChallenge(item)}
                >
                  <View style={styles.challengeContent}>
                    <Text style={styles.challengeTitle}>{item.title}</Text>
                    <Text style={styles.challengeDescription}>{item.description}</Text>
                  </View>
                  {item.premium && <Text style={styles.premiumBadge}>Pro</Text>}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No challenges available</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#FF6B6B',
    padding: 10,
    borderRadius: 5,
  },
  actionText: {
    color: '#FFF',
    fontSize: 16,
  },
  challengeSection: {
    padding: 20,
    alignItems: 'center',
  },
  startChallengeButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  startChallengeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    color: '#888',
  },
  challengeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  challengeContent: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  premiumBadge: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#888',
  },
});
