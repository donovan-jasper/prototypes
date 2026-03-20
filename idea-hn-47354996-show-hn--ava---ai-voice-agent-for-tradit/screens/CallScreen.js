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
    const canAnswerOrScreen = callData.status === 'ringing' && !callData.isScreening;
    const canEnd = callData.status === 'offhook';

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
      case 'screening':
        statusMessage = `AI Screening call from ${callerInfo}...`;
        statusColor = '#673AB7'; // Deep Purple
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
        {callData.status === 'screening' && (
          <ActivityIndicator size="small" color={statusColor} style={styles.screeningIndicator} />
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
            <Text style={styles.pastCallHeader}>Caller: {call.caller_id || 'Unknown'}</Text>
            <Text style={styles.pastCallTime}>Time: {new Date(call.call_time).toLocaleString()}</Text>
            {call.duration !== undefined && <Text style={styles.pastCallDetail}>Duration: {call.duration}s</Text>}
            {call.type && <Text style={styles.pastCallDetail}>Type: {call.type}</Text>}
            {call.summary && <Text style={styles.pastCallDetail}>Summary: {call.summary}</Text>}
            {call.transcript && (
              <Text style={styles.pastCallDetail} numberOfLines={2}>Transcript: {call.transcript}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CallGuard</Text>
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
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
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
    textAlign: 'center',
    marginBottom: 10,
  },
  durationText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 10,
  },
  screeningIndicator: {
    marginVertical: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 10,
  },
  transcriptLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#333',
  },
  transcriptScroll: {
    maxHeight: 150,
    backgroundColor: '#eef',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  transcriptText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    backgroundColor: '#eef',
    borderRadius: 5,
    padding: 10,
  },
  limitationText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
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
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pastCallHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  pastCallTime: {
    fontSize: 12,
    color: '#777',
    marginBottom: 5,
  },
  pastCallDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  noPastCallsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
    marginTop: 20,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default CallScreen;
