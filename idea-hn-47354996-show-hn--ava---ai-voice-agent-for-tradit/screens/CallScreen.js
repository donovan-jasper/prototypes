import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform, TouchableOpacity } from 'react-native';
import callHandler from '../services/callHandler';
import callScreeningService from '../services/callScreeningService';
import storage from '../services/storage';

function CallScreen() {
  const [callData, setCallData] = useState(callHandler.getCurrentCallState());
  const [pastCalls, setPastCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    callHandler.init();
    callHandler.addCallListener(setCallData);
    fetchPastCalls();

    return () => {
      callHandler.removeCallListener(setCallData);
      callHandler.deinit();
    };
  }, []);

  const fetchPastCalls = async () => {
    setIsLoading(true);
    try {
      const calls = await storage.getCallData();
      setPastCalls(calls);
    } catch (error) {
      console.error('Failed to fetch past calls:', error);
      Alert.alert('Error', 'Could not load past call history.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerCall = () => {
    callHandler.answerCall();
  };

  const handleEndCall = () => {
    callHandler.endCall();
  };

  const handleScreenCall = async () => {
    callHandler.screenCall();

    try {
      const screeningResult = await callScreeningService.screenCall(callData);

      callHandler.updateCallData({
        transcript: screeningResult.transcript,
        summary: screeningResult.summary,
        status: 'screening',
        confidence: screeningResult.confidence
      });

      // Save the screened call to history
      const callToSave = {
        id: callData.uuid || Date.now().toString(),
        caller_id: callData.callerId,
        call_time: new Date().toISOString(),
        duration: 0,
        summary: screeningResult.summary,
        transcript: screeningResult.transcript,
        type: 'screened',
        confidence: screeningResult.confidence
      };

      await storage.saveCallData(callToSave);
      await fetchPastCalls();
    } catch (error) {
      console.error('Screening failed:', error);
      Alert.alert('Error', 'Failed to screen the call. Please try again.');
    }
  };

  const renderCallStatus = () => {
    if (!callData || callData.status === 'idle') {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No active call.</Text>
          <Text style={styles.emptySubtext}>When a call comes in, you'll see options here.</Text>
        </View>
      );
    }

    let statusMessage = '';
    let statusColor = '#333';
    const callerInfo = callData.callerId || 'Unknown';
    const canAnswerOrScreen = callData.status === 'ringing' && !callData.isScreening;
    const canEnd = callData.status === 'offhook' || callData.status === 'screening';

    switch (callData.status) {
      case 'ringing':
        statusMessage = `Incoming call from ${callerInfo}...`;
        statusColor = '#FFC107';
        break;
      case 'offhook':
        statusMessage = `Call in progress with ${callerInfo}`;
        statusColor = '#4CAF50';
        break;
      case 'dialing':
        statusMessage = `Dialing ${callerInfo}...`;
        statusColor = '#2196F3';
        break;
      case 'onhold':
        statusMessage = `Call with ${callerInfo} on hold.`;
        statusColor = '#FF9800';
        break;
      case 'screening':
        statusMessage = `AI is screening call from ${callerInfo}...`;
        statusColor = '#673AB7';
        break;
      default:
        statusMessage = `Call state: ${callData.status} with ${callerInfo}`;
        statusColor = '#2196F3';
    }

    return (
      <View style={styles.callStatusContainer}>
        <Text style={[styles.statusText, { color: statusColor }]}>{statusMessage}</Text>
        {callData.status === 'offhook' && callData.duration > 0 && (
          <Text style={styles.durationText}>Duration: {callData.duration}s</Text>
        )}
        {callData.status === 'screening' && (
          <ActivityIndicator size="large" color={statusColor} style={styles.screeningIndicator} />
        )}

        {canAnswerOrScreen && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.screenButton]}
              onPress={handleScreenCall}
              disabled={callData.isScreening}
            >
              <Text style={styles.buttonText}>Screen Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.answerButton]}
              onPress={handleAnswerCall}
              disabled={callData.isScreening}
            >
              <Text style={styles.buttonText}>Answer Call</Text>
            </TouchableOpacity>
          </View>
        )}
        {canEnd && (
          <TouchableOpacity
            style={[styles.actionButton, styles.endButton]}
            onPress={handleEndCall}
          >
            <Text style={styles.buttonText}>End Call</Text>
          </TouchableOpacity>
        )}

        {(callData.status === 'offhook' || callData.status === 'screening' || callData.transcript) && (
          <>
            <Text style={styles.transcriptLabel}>Transcript:</Text>
            <ScrollView style={styles.transcriptScroll}>
              <Text style={styles.transcriptText}>{callData.transcript || 'Waiting for AI audio...'}</Text>
            </ScrollView>
          </>
        )}
        {(callData.status === 'offhook' || callData.status === 'screening' || callData.summary) && (
          <>
            <Text style={styles.summaryLabel}>Summary:</Text>
            <Text style={styles.summaryText}>{callData.summary || 'Generating summary...'}</Text>
            {callData.confidence && (
              <Text style={styles.confidenceText}>Confidence: {(callData.confidence * 100).toFixed(0)}%</Text>
            )}
          </>
        )}
      </View>
    );
  };

  const renderCallHistory = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" style={styles.loadingIndicator} />;
    }

    if (pastCalls.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No call history yet</Text>
          <Text style={styles.emptySubtext}>Screened calls will appear here.</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.historyContainer}>
        {pastCalls.map((call) => (
          <View key={call.id} style={styles.callItem}>
            <View style={styles.callHeader}>
              <Text style={styles.callerId}>{call.caller_id || 'Unknown'}</Text>
              <Text style={styles.callTime}>{new Date(call.call_time).toLocaleString()}</Text>
            </View>
            <Text style={styles.callSummary}>{call.summary}</Text>
            {call.confidence && (
              <Text style={styles.confidenceText}>Confidence: {(call.confidence * 100).toFixed(0)}%</Text>
            )}
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CallGuard</Text>
        <TouchableOpacity
          style={styles.historyToggle}
          onPress={() => setShowHistory(!showHistory)}
        >
          <Text style={styles.historyToggleText}>
            {showHistory ? 'Hide History' : 'Show History'}
          </Text>
        </TouchableOpacity>
      </View>

      {showHistory ? renderCallHistory() : renderCallStatus()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  historyToggle: {
    padding: 8,
    backgroundColor: '#673AB7',
    borderRadius: 4,
  },
  historyToggleText: {
    color: 'white',
    fontWeight: 'bold',
  },
  callStatusContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  durationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  screeningIndicator: {
    marginVertical: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenButton: {
    backgroundColor: '#673AB7',
  },
  answerButton: {
    backgroundColor: '#4CAF50',
  },
  endButton: {
    backgroundColor: '#F44336',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  transcriptLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    color: '#333',
  },
  transcriptScroll: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  transcriptText: {
    fontSize: 14,
    color: '#555',
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    color: '#333',
  },
  summaryText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  historyContainer: {
    flex: 1,
  },
  callItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  callHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  callerId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  callTime: {
    fontSize: 12,
    color: '#666',
  },
  callSummary: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default CallScreen;
