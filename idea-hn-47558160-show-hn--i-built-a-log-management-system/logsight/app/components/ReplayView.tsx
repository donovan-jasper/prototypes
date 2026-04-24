import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const ReplayView = ({ log }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [logSteps, setLogSteps] = useState([]);

  useEffect(() => {
    if (log && log.steps) {
      setLogSteps(log.steps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [log]);

  useEffect(() => {
    let interval;
    if (isPlaying && currentStep < logSteps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, logSteps]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStep = (direction) => {
    setIsPlaying(false);
    if (direction === 'next' && currentStep < logSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (direction === 'prev' && currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.stepItem,
        index === currentStep && styles.activeStep
      ]}
      onPress={() => {
        setCurrentStep(index);
        setIsPlaying(false);
      }}
    >
      <Text style={styles.timestamp}>{item.timestamp}</Text>
      <Text style={styles.message}>{item.message}</Text>
    </TouchableOpacity>
  );

  if (!log) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log Replay: {log.id}</Text>
      <Text style={styles.description}>{log.message}</Text>

      <View style={styles.controls}>
        <Button
          title="<< Prev"
          onPress={() => handleStep('prev')}
          disabled={currentStep === 0}
        />
        <Button
          title={isPlaying ? 'Pause' : 'Play'}
          onPress={handlePlayPause}
        />
        <Button
          title="Next >>"
          onPress={() => handleStep('next')}
          disabled={currentStep === logSteps.length - 1}
        />
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Step {currentStep + 1} of {logSteps.length}</Text>
      </View>

      <FlatList
        data={logSteps}
        renderItem={renderStep}
        keyExtractor={(item, index) => index.toString()}
        style={styles.stepsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 14,
    color: '#555',
  },
  stepsList: {
    maxHeight: 300,
  },
  stepItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'white',
  },
  activeStep: {
    backgroundColor: '#e3f2fd',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#333',
  },
});

export default ReplayView;
