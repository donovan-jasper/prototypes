import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import ConflictAlert from './ConflictAlert';
import useAIRuleInjection from '../hooks/useAIRuleInjection';
import { injectRulesIntoAISuggestion, getAISuggestions } from '../api/mockAIIntegration';

const AISuggestionDisplay = ({ prompt }) => {
  const { rules, checkCode } = useAIRuleInjection();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [modifiedSuggestion, setModifiedSuggestion] = useState('');
  const [violations, setViolations] = useState([]);

  useEffect(() => {
    if (prompt) {
      fetchSuggestions();
    }
  }, [prompt]);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const suggestions = await getAISuggestions(prompt);
      setSuggestions(suggestions);
      if (suggestions.length > 0) {
        processSuggestion(suggestions[0]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processSuggestion = (suggestion) => {
    setSelectedSuggestion(suggestion);
    const processedSuggestion = injectRulesIntoAISuggestion(suggestion, rules);
    setModifiedSuggestion(processedSuggestion);

    const foundViolations = rules.filter(rule => !checkCode(processedSuggestion, rule));
    setViolations(foundViolations);
    setIsAccepted(false);
    setIsRejected(false);
  };

  const handleAccept = () => {
    if (violations.length === 0) {
      setIsAccepted(true);
    }
  };

  const handleReject = () => {
    setIsRejected(true);
  };

  const renderHighlightedCode = () => {
    if (!modifiedSuggestion) return null;

    if (violations.length === 0) {
      return <Text style={styles.suggestionText}>{modifiedSuggestion}</Text>;
    }

    let highlightedText = modifiedSuggestion;
    violations.forEach(violation => {
      const regex = new RegExp(violation.pattern, 'g');
      highlightedText = highlightedText.replace(
        regex,
        match => `<span style="color: red; background-color: yellow;">${match}</span>`
      );
    });

    const parts = highlightedText.split(/<span[^>]*>|<\/span>/g);
    const styles = highlightedText.match(/<span[^>]*>/g) || [];

    return parts.map((part, i) => {
      if (i === 0) return <Text key={i} style={styles.suggestionText}>{part}</Text>;

      const isViolation = styles[i-1]?.includes('color: red');
      return (
        <Text key={i} style={isViolation ? [styles.suggestionText, styles.violationText] : styles.suggestionText}>
          {part}
        </Text>
      );
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Fetching AI suggestions...</Text>
      </View>
    );
  }

  if (suggestions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No suggestions available. Try a different prompt.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Suggestions</Text>

      <View style={styles.suggestionSelector}>
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.suggestionButton,
              selectedSuggestion === suggestion && styles.selectedSuggestion
            ]}
            onPress={() => processSuggestion(suggestion)}
          >
            <Text style={styles.suggestionButtonText}>Suggestion {index + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.suggestionContainer}>
        {renderHighlightedCode()}
      </ScrollView>

      {violations.length > 0 && (
        <View style={styles.violationsContainer}>
          <Text style={styles.violationsTitle}>Rule Violations:</Text>
          {violations.map((violation, index) => (
            <ConflictAlert
              key={index}
              message={`Violates: ${violation.name}`}
              severity={violation.severity || 'warning'}
            />
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
  suggestionSelector: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  suggestionButton: {
    padding: 8,
    backgroundColor: '#ddd',
    borderRadius: 4,
    marginRight: 8,
  },
  selectedSuggestion: {
    backgroundColor: '#4CAF50',
  },
  suggestionButtonText: {
    color: 'black',
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
  violationText: {
    color: 'red',
    backgroundColor: 'rgba(255, 200, 200, 0.5)',
    fontWeight: 'bold',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default AISuggestionDisplay;
