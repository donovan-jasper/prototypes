import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import callHandler from '../services/callHandler';

function CallScreen() {
  const [callData, setCallData] = useState(callHandler.getCurrentCallState());
  const [pastCalls, setPastCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleScreenCall = () => {
    callHandler.screenCall();
    // Simulate AI processing with a delay
    setTimeout(() => {
      const mockTranscript = "Hello, this is John calling about the project update. We need to discuss the timeline and budget constraints. The client is expecting a response by Friday.";
      const mockSummary = "John is calling about the project update. Key points: timeline, budget constraints, client deadline by Friday.";

      callHandler.updateCallData({
        transcript: mockTranscript,
        summary: mockSummary,
        status: 'screening'
      });
    }, 3000);
  };

  const renderCallStatus = () => {
    if (!callData || callData.status === 'idle') {
      return <Text style={styles.statusText}>No active call.</Text>;
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
            <Button title="Screen Call" onPress={handleScreenCall} color="#673AB7" disabled={callData.isScreening} />
            <Button title="Answer Call" onPress={handleAnswerCall} color="#4CAF50" disabled={callData.isScreening} />
          </View>
        )}
        {canEnd && (
          <Button title="End Call" onPress={handleEndCall} color="#F44336" />
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
          </>
        )}
        {Platform.OS === 'ios' && callData.status === 'ringing' && callData.callerId === 'Unknown' && (
          <Text style={styles.limitationText}>
            (Caller ID for cellular calls is not available on iOS for third-party apps.)
          </Text>
        )}
        {Platform.OS === 'android' && (callData.status === 'ringing' || callData.status === 'offhook') && (
          <Text style={styles.limitationText}>
            (Answering/Ending cellular calls programmatically is highly restricted on Android.)
          </Text>
        )}
      </View>
    );
  };

  const renderPastCalls = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#673AB7" />;
    }

    if (pastCalls.length === 0) {
      return <Text style={styles.noCallsText}>No past calls available.</Text>;
    }

    return (
      <ScrollView style={styles.pastCallsContainer}>
        {pastCalls.map((call, index) => (
          <View key={index} style={styles.callItem}>
            <Text style={styles.callItemText}>Caller: {call.caller_id || 'Unknown'}</Text>
            <Text style={styles.callItemText}>Time: {new Date(call.call_time).toLocaleString()}</Text>
            <Text style={styles.callItemText}>Duration: {call.duration}s</Text>
            <Text style={styles.callItemText}>Type: {call.type}</Text>
            <Text style={styles.callItemSummary}>Summary: {call.summary}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CallGuard</Text>
      {renderCallStatus()}
      <Text style={styles.sectionTitle}>Past Calls</Text>
      {renderPastCalls()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#673AB7',
  },
  callStatusContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  durationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  screeningIndicator: {
    marginVertical: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  transcriptLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#673AB7',
  },
  transcriptScroll: {
    maxHeight: 150,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  transcriptText: {
    fontSize: 14,
    color: '#333',
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#673AB7',
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    padding: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  limitationText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#673AB7',
  },
  pastCallsContainer: {
    flex: 1,
  },
  callItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  callItemText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  callItemSummary: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  noCallsText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CallScreen;
