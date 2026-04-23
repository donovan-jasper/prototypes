import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';

interface Review {
  id: string;
  source: string;
  score: number;
  text: string;
  publicationDate: string;
  publication: string;
}

interface ConsensusScoreProps {
  score: number;
  reviews: Review[];
}

const ConsensusScore: React.FC<ConsensusScoreProps> = ({ score, reviews }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 75) return '#4CAF50'; // Green
    if (score >= 50) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  const scoreColor = getScoreColor(score);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.scoreBadge, { backgroundColor: scoreColor }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.scoreText}>{score}</Text>
        <Text style={styles.scoreLabel}>Consensus Score</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Score Breakdown</Text>

            <ScrollView style={styles.reviewsList}>
              {reviews.map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <Text style={styles.reviewSource}>{review.source}</Text>
                  <Text style={styles.reviewScore}>{review.score}/10</Text>
                  <Text style={styles.reviewText}>{review.text}</Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  scoreBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreLabel: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  reviewsList: {
    maxHeight: '70%',
  },
  reviewItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  reviewSource: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reviewScore: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ConsensusScore;
