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
          ruleName: violation.name
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
            style={part.isViolation ? styles.violationText : null}
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
        <TouchableOpacity onPress={() => window.location.reload()}>
          <Text style={styles.retryButton}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Fetching AI suggestions and analyzing code...</Text>
      </View>
    );
  }

  if (apiError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {apiError}</Text>
        <TouchableOpacity onPress={fetchSuggestions}>
          <Text style={styles.retryButton}>Retry</Text>
        </TouchableOpacity>
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
        <View style={styles.analysisContainer}>
          <Text style={styles.analysisTitle}>AI Analysis:</Text>
          <Text style={styles.analysisText}>
            {aiAnalysis.summary || 'No analysis available'}
          </Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={handleAccept}
          disabled={isAccepted}
        >
          <Text style={styles.actionButtonText}>
            {isAccepted ? 'Accepted' : 'Accept'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={handleReject}
          disabled={isRejected}
        >
          <Text style={styles.actionButtonText}>
            {isRejected ? 'Rejected' : 'Reject'}
          </Text>
        </TouchableOpacity>
      </View>
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
    color: 'blue',
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  suggestionSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  suggestionButton: {
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  selectedSuggestion: {
    backgroundColor: '#bbdefb',
  },
  suggestionButtonText: {
    color: '#333',
  },
  suggestionContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  suggestionText: {
    fontFamily: 'monospace',
    fontSize: 14,
  },
  violationText: {
    color: 'red',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  violationsContainer: {
    marginBottom: 16,
  },
  violationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#d32f2f',
  },
  analysisContainer: {
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976d2',
  },
  analysisText: {
    fontSize: 14,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4caf50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AISuggestionDisplay;
