import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import callHandler from '../services/callHandler'; // Import the new call handler service
import storage from '../services/storage'; // To fetch past calls

function CallScreen() {
  const [callData, setCallData] = useState(callHandler.getCurrentCallState()); // Stores current call state
  const [pastCalls, setPastCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize call screening and add listener
    callHandler.init();
    callHandler.addCallListener(setCallData);
    fetchPastCalls();

    return () => {
      // Clean up listener and deinitialize on unmount
      callHandler.removeCallListener(setCallData);
      callHandler.deinit();
    };
  }, []);

  const fetchPastCalls = async () => {
    setIsLoading(true);
    try {
      const calls = await storage.getCallData(); // Assuming storage.js has a getCallData method
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
  };

  const renderCallStatus = () => {
    if (!callData || callData.status === 'idle') {
      return <Text style={styles.statusText}>No active call.</Text>;
    }

    let statusMessage = '';
    let statusColor = '#333';
    const callerInfo = callData.callerId || 'Unknown';

    switch (callData.status) {
      case 'ringing':
        statusMessage = `Incoming call from ${callerInfo}...`;
        statusColor = '#FFC107'; // Amber
        break;
      case 'offhook':
        statusMessage = `Call in progress with ${callerInfo}`;
        statusColor = '#4CAF50'; // Green
        break;
      case 'dialing':
        statusMessage = `Dialing ${callerInfo}...`;
        statusColor = '#2196F3'; // Blue
        break;
      case 'onhold':
        statusMessage = `Call with ${callerInfo} on hold.`;
        statusColor = '#FF9800'; // Orange
        break;
      default:
        statusMessage = `Call state: ${callData.status} with ${callerInfo}`;
        statusColor = '#2196F3'; // Blue
    }

    return (
      <View style={styles.callStatusContainer}>
        <Text style={[styles.statusText, { color: statusColor }]}>{statusMessage}</Text>
        {callData.status === 'offhook' && callData.duration > 0 && (
          <Text style={styles.durationText}>Duration: {callData.duration}s</Text>
        )}

        {callData.status === 'ringing' && (
          <View style={styles.buttonRow}>
            <Button title="Screen Call" onPress={handleScreenCall} color="#673AB7" />
            <Button title="Answer Call" onPress={handleAnswerCall} color="#4CAF50" />
          </View>
        )}
        {callData.status === 'offhook' && (
          <Button title="End Call" onPress={handleEndCall} color="#F44336" />
        )}

        {(callData.status === 'offhook' || callData.transcript) && (
          <>
            <Text style={styles.transcriptLabel}>Transcript:</Text>
            <ScrollView style={styles.transcriptScroll}>
              <Text style={styles.transcriptText}>{callData.transcript || 'Waiting for audio...'}</Text>
            </ScrollView>
          </>
        )}
        {(callData.status === 'offhook' || callData.summary) && (
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
      return <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />;
    }
    if (pastCalls.length === 0) {
      return <Text style={styles.noPastCallsText}>No past calls recorded.</Text>;
    }
    return (
      <ScrollView style={styles.pastCallsScroll}>
        <Text style={styles.sectionTitle}>Past Calls</Text>
        {pastCalls.map((call, index) => (
          <View key={call.id || index} style={styles.pastCallItem}>
            <Text style={styles.pastCallHeader}>Caller: {call.caller_id} - {new Date(call.call_time).toLocaleString()}</Text>
            <Text style={styles.pastCallSummary}>Summary: {call.summary}</Text>
            <Text style={styles.pastCallTranscript}>Transcript: {call.transcript.substring(0, 100)}...</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>CallGuard Live Screening</Text>
      {renderCallStatus()}
      <View style={styles.separator} />
      {renderPastCalls()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  callStatusContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  durationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  transcriptLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#555',
  },
  transcriptScroll: {
    maxHeight: 100,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  transcriptText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#555',
  },
  summaryText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  limitationText: {
    fontSize: 12,
    color: '#888',
    marginTop: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  noPastCallsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  pastCallsScroll: {
    flex: 1,
  },
  pastCallItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  pastCallHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  pastCallSummary: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  pastCallTranscript: {
    fontSize: 12,
    color: '#777',
  },
});

export default CallScreen;
