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
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
        statusMessage = `Dialing ${callData.callerId}...`;
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
          <View>
            <ActivityIndicator size="large" color={statusColor} style={styles.screeningIndicator} />
            {callData.transcript && (
              <View style={styles.screeningResults}>
                <Text style={styles.sectionTitle}>Transcript:</Text>
                <Text style={styles.transcriptText}>{callData.transcript}</Text>
                <Text style={styles.sectionTitle}>Summary:</Text>
                <Text style={styles.summaryText}>{callData.summary}</Text>
                <Text style={styles.confidenceText}>Confidence: {(callData.confidence * 100).toFixed(0)}%</Text>
              </View>
            )}
          </View>
        )}

        {canAnswerOrScreen && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.answerButton]}
              onPress={handleAnswerCall}
            >
              <Text style={styles.buttonText}>Answer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.screenButton]}
              onPress={handleScreenCall}
            >
              <Text style={styles.buttonText}>Screen</Text>
            </TouchableOpacity>
          </View>
        )}

        {canEnd && (
          <TouchableOpacity
            style={[styles.button, styles.endButton]}
            onPress={handleEndCall}
          >
            <Text style={styles.buttonText}>End Call</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderPastCalls = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#673AB7" />;
    }

    if (pastCalls.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No past calls yet.</Text>
          <Text style={styles.emptySubtext}>Screened calls will appear here.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={pastCalls}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.callItem}>
            <Text style={styles.callItemTitle}>{item.caller_id || 'Unknown'}</Text>
            <Text style={styles.callItemTime}>{new Date(item.call_time).toLocaleString()}</Text>
            <Text style={styles.callItemSummary}>{item.summary}</Text>
            <Text style={styles.callItemConfidence}>Confidence: {(item.confidence * 100).toFixed(0)}%</Text>
          </View>
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>CallGuard</Text>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => setShowHistory(!showHistory)}
        >
          <Text style={styles.historyButtonText}>
            {showHistory ? 'Hide History' : 'Show History'}
          </Text>
        </TouchableOpacity>
      </View>

      {showHistory ? (
        <View style={styles.historyContainer}>
          <Text style={styles.sectionTitle}>Call History</Text>
          {renderPastCalls()}
        </View>
      ) : (
        renderCallStatus()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#673AB7',
  },
  historyButton: {
    padding: 10,
    backgroundColor: '#673AB7',
    borderRadius: 5,
  },
  historyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  callStatusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  durationText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    width: 120,
    alignItems: 'center',
  },
  answerButton: {
    backgroundColor: '#4CAF50',
  },
  screenButton: {
    backgroundColor: '#673AB7',
  },
  endButton: {
    backgroundColor: '#F44336',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  screeningIndicator: {
    marginVertical: 20,
  },
  screeningResults: {
    width: '100%',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 5,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#673AB7',
  },
  transcriptText: {
    fontSize: 14,
    marginBottom: 15,
    color: '#333',
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 15,
    color: '#333',
    fontStyle: 'italic',
  },
  confidenceText: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  historyContainer: {
    flex: 1,
  },
  callItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  callItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  callItemTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  callItemSummary: {
    fontSize: 14,
    marginBottom: 5,
  },
  callItemConfidence: {
    fontSize: 12,
    color: '#666',
  },
});

export default CallScreen;
