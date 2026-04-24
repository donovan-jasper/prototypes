import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated } from 'react-native';

const ReplayView = ({ log }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [logSteps, setLogSteps] = useState([]);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const listRef = useRef(null);

  useEffect(() => {
    if (log && log.steps) {
      setLogSteps(log.steps);
      setCurrentStep(0);
      setIsPlaying(false);
      progressAnim.setValue(0);
    }
  }, [log]);

  useEffect(() => {
    let interval;
    if (isPlaying && currentStep < logSteps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          const nextStep = prev + 1;
          if (nextStep >= logSteps.length) {
            setIsPlaying(false);
            return prev;
          }
          return nextStep;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, logSteps]);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / logSteps.length,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Scroll to current step
    if (listRef.current && logSteps.length > 0) {
      listRef.current.scrollToIndex({
        index: currentStep,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [currentStep]);

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
      <View style={styles.stepHeader}>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
        <Text style={styles.stepNumber}>Step {index + 1}</Text>
      </View>
      <Text style={styles.message}>{item.message}</Text>
      {item.details && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Details:</Text>
          <Text style={styles.detailsText}>{item.details}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (!log) return null;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Log Replay: {log.id}</Text>
        <Text style={styles.description}>{log.message}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, currentStep === 0 && styles.disabledButton]}
          onPress={() => handleStep('prev')}
          disabled={currentStep === 0}
        >
          <Text style={styles.controlText}>⏮ Prev</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayPause}
        >
          <Text style={styles.playText}>{isPlaying ? '⏸ Pause' : '▶ Play'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, currentStep === logSteps.length - 1 && styles.disabledButton]}
          onPress={() => handleStep('next')}
          disabled={currentStep === logSteps.length - 1}
        >
          <Text style={styles.controlText}>Next ⏭</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} of {logSteps.length} steps
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={logSteps}
        renderItem={renderStep}
        keyExtractor={(item, index) => index.toString()}
        style={styles.stepsList}
        initialNumToRender={10}
        windowSize={5}
        getItemLayout={(data, index) => ({
          length: 100,
          offset: 100 * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  controlButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  playButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  controlText: {
    color: 'white',
    fontWeight: 'bold',
  },
  playText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBarBackground: {
    height: 5,
    backgroundColor: '#ecf0f1',
    borderRadius: 2.5,
    marginBottom: 5,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 2.5,
  },
  progressText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: 12,
  },
  stepsList: {
    flex: 1,
  },
  stepItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  activeStep: {
    borderLeftColor: '#3498db',
    backgroundColor: '#f0f7ff',
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3498db',
  },
  message: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 5,
  },
  detailsContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 3,
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginBottom: 3,
  },
  detailsText: {
    fontSize: 12,
    color: '#2c3e50',
  },
});

export default ReplayView;
