import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import CallScreening from '../components/CallScreening';
import storage from '../services/storage'; // To fetch past calls

function CallScreen() {
  const [callData, setCallData] = useState(null); // Stores current call state
  const [pastCalls, setPastCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize call screening and add listener
    CallScreening.init();
    CallScreening.addCallListener(setCallData);
    fetchPastCalls();

    return () => {
      // Clean up listener and deinitialize on unmount
      CallScreening.removeCallListener(setCallData);
      CallScreening.deinit();
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
    CallScreening.answerCall();
  };

  const handleEndCall = () => {
    CallScreening.endCall();
  };

  const renderCallStatus = () => {
    if (!callData) {
      return <Text style={styles.statusText}>No active call.</Text>;
    }

    let statusMessage = '';
    let statusColor = '#333';

    switch (callData.status) {
      case 'ringing':
        statusMessage = `Incoming call from ${callData.callerId}...`;
        statusColor = '#FFC107'; // Amber
        break;
      case 'offhook':
        statusMessage = `Call in progress with ${callData.callerId}`;
        statusColor = '#4CAF50'; // Green
        break;
      case 'idle':
        statusMessage = `Call ended with ${callData.callerId}`;
        statusColor = '#F44336'; // Red
        break;
      default:
        statusMessage = `Call state: ${callData.status}`;
        statusColor = '#2196F3'; // Blue
    }

    return (
      <View style={styles.callStatusContainer}>
        <Text style={[styles.statusText, { color: statusColor }]}>{statusMessage}</Text>
        {callData.status === 'ringing' && (
          <Button title="Answer Call" onPress={handleAnswerCall} color="#4CAF50" />
        )}
        {callData.status === 'offhook' && (
          <Button title="End Call" onPress={handleEndCall} color="#F44336" />
        )}
        {callData.status !== 'idle' && callData.status !== 'ringing' && (
          <Text style={styles.transcriptLabel}>Transcript:</Text>
        )}
        {callData.status !== 'idle' && callData.status !== 'ringing' && (
          <ScrollView style={styles.transcriptScroll}>
            <Text style={styles.transcriptText}>{callData.transcript || 'Waiting for audio...'}</Text>
          </ScrollView>
        )}
        {callData.status !== 'idle' && callData.status !== 'ringing' && (
          <Text style={styles.summaryLabel}>Summary:</Text>
        )}
        {callData.status !== 'idle' && callData.status !== 'ringing' && (
          <Text style={styles.summaryText}>{callData.summary || 'Generating summary...'}</Text>
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
  transcriptLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#555',
  },
  transcriptScroll: {
    maxHeight: 150,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  transcriptText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
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
    lineHeight: 20,
    color: '#444',
    fontStyle: 'italic',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
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
    marginBottom: 3,
  },
  pastCallTranscript: {
    fontSize: 12,
    color: '#777',
  },
  loadingIndicator: {
    marginTop: 50,
  },
  noPastCallsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
    marginTop: 20,
  },
});

export default CallScreen;
