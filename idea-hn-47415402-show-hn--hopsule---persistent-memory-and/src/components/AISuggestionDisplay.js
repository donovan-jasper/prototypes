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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading rules...</Text>
      </View>
    );
  }

  if (rulesError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading rules: {rulesError.message}</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Fetching AI suggestions...</Text>
      </View>
    );
  }

  if (apiError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {apiError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchSuggestions}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!selectedSuggestion) {
    return (
      <View style={styles.container}>
        <Text style={styles.noSuggestionsText}>No suggestions available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.suggestionContainer}>
          <Text style={styles.sectionTitle}>AI Suggestion</Text>
          {renderHighlightedCode()}

          {violations.length > 0 && (
            <View style={styles.violationsContainer}>
              <Text style={styles.sectionTitle}>Rule Violations</Text>
              {violations.map((violation, index) => (
                <ConflictAlert
                  key={index}
                  ruleName={violation.name}
                  severity={violation.severity}
                  message={`Pattern: ${violation.pattern}`}
                />
              ))}
            </View>
          )}

          {aiAnalysis && (
            <View style={styles.analysisContainer}>
              <Text style={styles.sectionTitle}>AI Analysis</Text>
              <Text style={styles.analysisText}>
                Complexity: {aiAnalysis.complexity || 'N/A'}
              </Text>
              <Text style={styles.analysisText}>
                Maintainability: {aiAnalysis.maintainability || 'N/A'}
              </Text>
              <Text style={styles.analysisText}>
                Performance: {aiAnalysis.performance || 'N/A'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={handleReject}
          disabled={isRejected}
        >
          <Text style={styles.actionButtonText}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={handleAccept}
          disabled={isAccepted}
        >
          <Text style={styles.actionButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  suggestionContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  suggestionText: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  violationText: {
    backgroundColor: 'rgba(255, 204, 204, 0.5)',
    color: '#d32f2f',
  },
  errorViolation: {
    backgroundColor: 'rgba(255, 152, 152, 0.7)',
    color: '#b71c1c',
    fontWeight: 'bold',
  },
  violationsContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  analysisContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  analysisText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#555',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  noSuggestionsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default AISuggestionDisplay;
