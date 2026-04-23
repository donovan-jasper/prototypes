import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppContext } from '../context/AppContext';

export const AlertControls: React.FC = () => {
  const {
    uiState,
    on: onEvent,
    off: offEvent,
  } = useAppContext();

  const handleSnooze = () => {
    // Emit snooze event (5 minutes)
    onEvent('snoozeAlert', 300000);
  };

  const handleReset = () => {
    // Emit reset event
    onEvent('resetAlert');
  };

  if (!uiState.isAlertActive) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.alertText}>
        {uiState.isSnoozed
          ? `Alert snoozed until ${new Date(uiState.snoozeEndTime || 0).toLocaleTimeString()}`
          : `Alert Level ${uiState.alertLevel}`}
      </Text>

      <View style={styles.buttonContainer}>
        {!uiState.isSnoozed && (
          <TouchableOpacity
            style={[styles.button, styles.snoozeButton]}
            onPress={handleSnooze}
          >
            <Text style={styles.buttonText}>Snooze (5 min)</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={handleReset}
        >
          <Text style={styles.buttonText}>Reset Alert</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  snoozeButton: {
    backgroundColor: '#FFC107',
  },
  resetButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
