import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import ConflictAlert from './ConflictAlert';
import useAIRuleInjection from '../hooks/useAIRuleInjection';
import { injectRulesIntoAISuggestion, getAISuggestions, analyzeCodeWithAI } from '../api/realAIIntegration';

const AISuggestionDisplay = ({ prompt }) => {
  const { rules, checkCode } = useAIRuleInjection();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [modifiedSuggestion, setModifiedSuggestion] = useState('');
  const [violations, setViolations] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);

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
        await processSuggestion(suggestions[0]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      Alert.alert('Error', 'Failed to fetch AI suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const processSuggestion = async (suggestion) => {
    setSelectedSuggestion(suggestion);
    const processedSuggestion = injectRulesIntoAISuggestion(suggestion, rules);
    setModifiedSuggestion(processedSuggestion);

    const foundViolations = rules.filter(rule => !checkCode(processedSuggestion, rule));
    setViolations(foundViolations);

    // Get AI analysis of the suggestion
    try {
      const analysis = await analyzeCodeWithAI(suggestion);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing code with AI:', error);
    }

    setIsAccepted(false);
    setIsRejected(false);
  };

  const handleAccept = () => {
    if (violations.length === 0) {
      setIsAccepted(true);
      Alert.alert('Success', 'Suggestion accepted and ready to use!');
    } else {
      Alert.alert('Warning', 'Cannot accept suggestion with rule violations');
    }
  };

  const handleReject = () => {
    setIsRejected(true);
    Alert.alert('Rejected', 'Suggestion has been rejected');
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
        <Text>Fetching AI suggestions and analyzing code...</Text>
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

      {aiAnalysis && (
        <View style={styles.aiAnalysisContainer}>
          <Text style={styles.aiAnalysisTitle}>AI Analysis:</Text>
          <Text style={styles.aiAnalysisText}>
            Complexity: {aiAnalysis.complexity || 'N/A'} | Maintainability: {aiAnalysis.maintainability || 'N/A'}
          </Text>
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
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Suggestion accepted!</Text>
        </View>
      )}

      {isRejected && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Suggestion rejected</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  suggestionSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  suggestionButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  selectedSuggestion: {
    backgroundColor: '#007AFF',
  },
  suggestionButtonText: {
    color: '#333',
  },
  suggestionContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  suggestionText: {
    fontFamily: 'monospace',
    fontSize: 14,
  },
  violationText: {
    color: '#d32f2f',
    backgroundColor: '#ffebee',
  },
  violationsContainer: {
    marginBottom: 16,
  },
  violationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  aiAnalysisContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 4,
  },
  aiAnalysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  aiAnalysisText: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    padding: 12,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 4,
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
  statusContainer: {
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
    marginTop: 16,
  },
  statusText: {
    color: '#2e7d32',
    textAlign: 'center',
  },
});

export default AISuggestionDisplay;
