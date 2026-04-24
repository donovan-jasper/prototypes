import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Quiz from '../components/Quiz';
import DecisionTracker from '../components/DecisionTracker';
import { initDatabase } from '../utils/storage';

const Home: React.FC = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [showTracker, setShowTracker] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await initDatabase();
    };
    initialize();
  }, []);

  return (
    <View style={styles.container}>
      {showQuiz ? (
        <Quiz onComplete={() => {
          setShowQuiz(false);
          setShowTracker(true);
        }} />
      ) : showTracker ? (
        <DecisionTracker />
      ) : (
        <View style={styles.homeContent}>
          <Text style={styles.title}>Calibrate</Text>
          <Text style={styles.subtitle}>Train your gut instincts to make better decisions</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowQuiz(true)}
          >
            <Text style={styles.buttonText}>Start Daily Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => setShowTracker(true)}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>View History</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  homeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    marginBottom: 15,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#4CAF50',
  },
});

export default Home;
