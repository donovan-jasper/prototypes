import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import ConflictAlert from './ConflictAlert';
import useAIRuleInjection from '../hooks/useAIRuleInjection';
import { injectRulesIntoAISuggestion, getAISuggestions, analyzeCodeWithAI } from '../api/realAIIntegration';

const AISuggestionDisplay = ({ prompt }) => {
  const { rules, isLoading: rulesLoading, error: rulesError, injectRulesIntoAISuggestion: localInjectRules } = useAIRuleInjection();
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
      const processedSuggestion = await localInjectRules(suggestion);
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
        <Text style={styles.errorText}>{rulesError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
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
        <Text style={styles.errorText}>{apiError}</Text>
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

        <Text style={styles.suggestionTitle}>Modified Suggestion:</Text>
        <ScrollView horizontal style={styles.codeContainer}>
          {renderHighlightedCode()}
        </ScrollView>
      </View>

      {aiAnalysis && (
        <View style={styles.analysisContainer}>
          <Text style={styles.analysisTitle}>AI Analysis:</Text>
          <Text style={styles.analysisText}>
            Complexity: {aiAnalysis.complexity || 'N/A'} | Maintainability: {aiAnalysis.maintainability || 'N/A'}
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
            {isAccepted ? 'Accepted' : 'Accept Suggestion'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={handleReject}
          disabled={isRejected}
        >
          <Text style={styles.actionButtonText}>
            {isRejected ? 'Rejected' : 'Reject Suggestion'}
          </Text>
        </TouchableOpacity>
      </View>

      {suggestions.length > 1 && (
        <View style={styles.moreSuggestions}>
          <Text style={styles.moreSuggestionsText}>More suggestions available:</Text>
          {suggestions.slice(1).map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => processSuggestion(suggestion)}
            >
              <Text style={styles.suggestionItemText} numberOfLines={1}>
                {suggestion.substring(0, 50)}...
              </Text>
            </TouchableOpacity>
          ))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noSuggestionsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
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
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  codeContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    maxHeight: 200,
  },
  suggestionText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#333',
  },
  violationText: {
    backgroundColor: 'rgba(255, 204, 0, 0.3)',
    color: '#D4A017',
  },
  errorViolation: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    color: '#D32F2F',
  },
  analysisContainer: {
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
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  analysisText: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    padding: 12,
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
    fontWeight: 'bold',
  },
  moreSuggestions: {
    marginTop: 16,
  },
  moreSuggestionsText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  suggestionItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionItemText: {
    fontSize: 14,
    color: '#333',
  },
});

export default AISuggestionDisplay;
