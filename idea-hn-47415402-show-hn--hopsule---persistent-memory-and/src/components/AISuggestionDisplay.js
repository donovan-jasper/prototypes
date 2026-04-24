import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import ConflictAlert from './ConflictAlert';
import useAIRuleInjection from '../hooks/useAIRuleInjection';
import { injectRulesIntoAISuggestion } from '../api/mockAIIntegration';

const AISuggestionDisplay = ({ suggestion }) => {
  const { rules, checkCode } = useAIRuleInjection();
  const [isAccepted, setIsAccepted] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [modifiedSuggestion, setModifiedSuggestion] = useState(suggestion);

  const violations = rules.filter(rule => !checkCode(suggestion));

  const handleAccept = () => {
    if (violations.length === 0) {
      setIsAccepted(true);
    }
  };

  const handleReject = () => {
    setIsRejected(true);
  };

  // Apply rule injection when component mounts or suggestion changes
  React.useEffect(() => {
    const processedSuggestion = injectRulesIntoAISuggestion(suggestion, rules);
    setModifiedSuggestion(processedSuggestion);
  }, [suggestion, rules]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Suggestion</Text>

      <ScrollView style={styles.suggestionContainer}>
        <Text style={styles.suggestionText}>{modifiedSuggestion}</Text>
      </ScrollView>

      {violations.length > 0 && (
        <View style={styles.violationsContainer}>
          <Text style={styles.violationsTitle}>Rule Violations:</Text>
          {violations.map((violation, index) => (
            <ConflictAlert key={index} message={`Violates: ${violation.name}`} />
          ))}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.acceptButton, violations.length > 0 && styles.disabledButton]}
          onPress={handleAccept}
          disabled={violations.length > 0}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={handleReject}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>

      {isAccepted && (
        <Text style={styles.statusText}>Suggestion accepted!</Text>
      )}

      {isRejected && (
        <Text style={styles.statusText}>Suggestion rejected.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  suggestionContainer: {
    maxHeight: 200,
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  suggestionText: {
    fontFamily: 'monospace',
  },
  violationsContainer: {
    marginBottom: 10,
  },
  violationsTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statusText: {
    marginTop: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default AISuggestionDisplay;
