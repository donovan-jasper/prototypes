import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import ConflictAlert from './ConflictAlert';
import useAIRuleInjection from '../hooks/useAIRuleInjection';
import { getAISuggestions, analyzeCodeWithAI } from '../api/realAIIntegration';

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
      // Process with both local rules and AI refinement
      const result = await injectRulesIntoAISuggestion(suggestion);
      setModifiedSuggestion(result.code);
      setViolations(result.violations);

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
    const sortedViolations = [...violations].sort((a, b) => a.position - b.position);

    sortedViolations.forEach(violation => {
      // Add text before the violation
      if (violation.position > lastIndex) {
        parts.push({
          text: modifiedSuggestion.substring(lastIndex, violation.position),
          isViolation: false
        });
      }

      // Add the violation text
      parts.push({
        text: violation.match,
        isViolation: true,
        ruleName: violation.ruleName,
        severity: violation.severity
      });

      lastIndex = violation.position + violation.match.length;
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

  const renderViolationList = () => {
    if (!violations.length) return null;

    return (
      <View style={styles.violationsContainer}>
        <Text style={styles.violationsTitle}>Rule Violations:</Text>
        {violations.map((violation, index) => (
          <View key={index} style={styles.violationItem}>
            <Text style={[
              styles.violationText,
              violation.severity === 'error' ? styles.errorViolation : null
            ]}>
              {violation.ruleName} ({violation.severity})
            </Text>
            <Text style={styles.violationMatch}>"{violation.match}"</Text>
          </View>
        ))}
      </View>
    );
  };

  if (isLoading || rulesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading AI suggestions...</Text>
      </View>
    );
  }

  if (apiError || rulesError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{apiError || rulesError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchSuggestions}>
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
      <View style={styles.suggestionContainer}>
        <Text style={styles.suggestionTitle}>AI Suggestion</Text>
        <ScrollView horizontal style={styles.codeContainer}>
          {renderHighlightedCode()}
        </ScrollView>

        {renderViolationList()}

        {aiAnalysis && (
          <View style={styles.aiAnalysisContainer}>
            <Text style={styles.aiAnalysisTitle}>AI Analysis</Text>
            <Text style={styles.aiAnalysisText}>{aiAnalysis.summary}</Text>
            <Text style={styles.aiAnalysisScore}>Score: {aiAnalysis.score}/10</Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAccept}
            disabled={isAccepted || isRejected}
          >
            <Text style={styles.actionButtonText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={handleReject}
            disabled={isAccepted || isRejected}
          >
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>

        {isAccepted && (
          <ConflictAlert
            message="Suggestion accepted with rule violations"
            severity="warning"
          />
        )}

        {isRejected && (
          <ConflictAlert
            message="Suggestion rejected"
            severity="error"
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  noSuggestionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noSuggestionText: {
    fontSize: 16,
    color: '#666',
  },
  suggestionContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  codeContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    maxHeight: 200,
  },
  suggestionText: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 20,
  },
  violationText: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  errorViolation: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  violationsContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
  },
  violationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#495057',
  },
  violationItem: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#ffc107',
  },
  violationMatch: {
    fontFamily: 'monospace',
    fontSize: 13,
    marginTop: 4,
    color: '#6c757d',
  },
  aiAnalysisContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#e9f7fe',
    borderRadius: 5,
  },
  aiAnalysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#17a2b8',
  },
  aiAnalysisText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
  },
  aiAnalysisScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AISuggestionDisplay;
