import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import ConflictAlert from './ConflictAlert';
import useAIRuleInjection from '../hooks/useAIRuleInjection';
import { injectRulesIntoAISuggestion, getAISuggestions, analyzeCodeWithAI } from '../api/realAIIntegration';

const AISuggestionDisplay = ({ prompt }) => {
  const { rules, isLoading: rulesLoading, error: rulesError, injectRulesIntoAISuggestion } = useAIRuleInjection();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [modifiedSuggestion, setModifiedSuggestion] = useState('');
  const [violations, setViolations] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    if (prompt && !rulesLoading) {
      fetchSuggestions();
    }
  }, [prompt, rulesLoading]);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    setApiError(null);

    try {
      const suggestions = await getAISuggestions(prompt);
      setSuggestions(suggestions);

      if (suggestions.length > 0) {
        await processSuggestion(suggestions[0]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setApiError(error.message || 'Failed to fetch AI suggestions');
      Alert.alert('Error', error.message || 'Failed to fetch AI suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const processSuggestion = async (suggestion) => {
    setSelectedSuggestion(suggestion);
    setIsAccepted(false);
    setIsRejected(false);

    try {
      // Process with rules
      const processedSuggestion = injectRulesIntoAISuggestion(suggestion, rules);
      setModifiedSuggestion(processedSuggestion);

      // Check for violations
      const foundViolations = rules.filter(rule => {
        const regex = new RegExp(rule.pattern);
        return regex.test(processedSuggestion);
      });
      setViolations(foundViolations);

      // Get AI analysis
      const analysis = await analyzeCodeWithAI(suggestion);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Error processing suggestion:', error);
      setApiError(error.message || 'Failed to process suggestion');
      Alert.alert('Error', error.message || 'Failed to process suggestion');
    }
  };

  const handleAccept = () => {
    if (violations.length > 0) {
      Alert.alert(
        'Warning',
        'This suggestion contains rule violations. Are you sure you want to accept it?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Accept Anyway',
            onPress: () => setIsAccepted(true),
            style: 'destructive'
          }
        ]
      );
    } else {
      setIsAccepted(true);
      Alert.alert('Success', 'Suggestion accepted and ready to use!');
    }
  };

  const handleReject = () => {
    setIsRejected(true);
    Alert.alert('Rejected', 'Suggestion has been rejected');
  };

  const renderHighlightedCode = () => {
    if (!modifiedSuggestion) return null;

    const parts = [];
    let lastIndex = 0;

    // Sort violations by their position in the code
    const sortedViolations = [...violations].sort((a, b) => {
      const aIndex = modifiedSuggestion.indexOf(a.pattern);
      const bIndex = modifiedSuggestion.indexOf(b.pattern);
      return aIndex - bIndex;
    });

    sortedViolations.forEach(violation => {
      const regex = new RegExp(violation.pattern, 'g');
      let match;

      while ((match = regex.exec(modifiedSuggestion)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          parts.push({
            text: modifiedSuggestion.substring(lastIndex, match.index),
            isViolation: false
          });
        }

        // Add the violation text
        parts.push({
          text: match[0],
          isViolation: true,
          ruleName: violation.name,
          severity: violation.severity
        });

        lastIndex = regex.lastIndex;
      }
    });

    // Add remaining text
    if (lastIndex < modifiedSuggestion.length) {
      parts.push({
        text: modifiedSuggestion.substring(lastIndex),
        isViolation: false
      });
    }

    return (
      <Text style={styles.suggestionText}>
        {parts.map((part, index) => (
          <Text
            key={index}
            style={[
              part.isViolation ? styles.violationText : null,
              part.severity === 'error' ? styles.errorViolation : null
            ]}
          >
            {part.text}
          </Text>
        ))}
      </Text>
    );
  };

  if (rulesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading team rules...</Text>
      </View>
    );
  }

  if (rulesError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading rules: {rulesError}</Text>
        <TouchableOpacity onPress={fetchSuggestions} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Fetching AI suggestions...</Text>
      </View>
    );
  }

  if (apiError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {apiError}</Text>
        <TouchableOpacity onPress={fetchSuggestions} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!selectedSuggestion) {
    return (
      <View style={styles.noSuggestionContainer}>
        <Text style={styles.noSuggestionText}>No suggestions available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>AI Suggestions</Text>
        {violations.length > 0 && (
          <ConflictAlert
            violations={violations}
            onPress={() => Alert.alert('Rule Violations', violations.map(v => `${v.name} (${v.severity})`).join('\n'))}
          />
        )}
      </View>

      <View style={styles.suggestionContainer}>
        <Text style={styles.suggestionTitle}>Original Suggestion:</Text>
        <ScrollView horizontal style={styles.codeContainer}>
          <Text style={styles.suggestionText}>{selectedSuggestion}</Text>
        </ScrollView>

        <Text style={styles.suggestionTitle}>Processed Suggestion:</Text>
        <ScrollView horizontal style={styles.codeContainer}>
          {renderHighlightedCode()}
        </ScrollView>
      </View>

      {aiAnalysis && (
        <View style={styles.analysisContainer}>
          <Text style={styles.analysisTitle}>AI Analysis:</Text>
          <Text style={styles.analysisText}>{JSON.stringify(aiAnalysis, null, 2)}</Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={handleAccept}
          disabled={isAccepted || isRejected}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={handleReject}
          disabled={isAccepted || isRejected}
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
    </ScrollView>
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
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
  },
  noSuggestionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSuggestionText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  suggestionContainer: {
    marginBottom: 20,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  codeContainer: {
    backgroundColor: '#282c34',
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
    maxHeight: 200,
  },
  suggestionText: {
    color: '#abb2bf',
    fontFamily: 'monospace',
  },
  violationText: {
    color: '#ffcc00',
    backgroundColor: 'rgba(255, 204, 0, 0.2)',
  },
  errorViolation: {
    color: '#ff6b6b',
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  analysisContainer: {
    marginBottom: 20,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  analysisText: {
    fontFamily: 'monospace',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    padding: 12,
    borderRadius: 5,
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
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statusContainer: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#e3f2fd',
    marginTop: 10,
  },
  statusText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default AISuggestionDisplay;
