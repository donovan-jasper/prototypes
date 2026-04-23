import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import callHandler from '../services/callHandler';
import callScreeningService from '../services/callScreeningService';
import storage from '../services/storage';

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

  const handleScreenCall = async () => {
    callHandler.screenCall();

    try {
      const screeningResult = await callScreeningService.screenCall(callData);

      callHandler.updateCallData({
        transcript: screeningResult.transcript,
        summary: screeningResult.summary,
        status: 'screening'
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
        {Platform.OS === 'android' && (callData.status === 'ringing' || callData.status === 'screening') && (
          <Text style={styles.limitationText}>
            (Note: Call screening may not work on all Android devices due to system restrictions.)
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderCallStatus()}

        <Text style={styles.sectionTitle}>Past Calls</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#673AB7" />
        ) : pastCalls.length > 0 ? (
          <View style={styles.pastCallsContainer}>
            {pastCalls.map((call, index) => (
              <View key={index} style={styles.callItem}>
                <Text style={styles.callItemTitle}>{call.caller_id || 'Unknown'}</Text>
                <Text style={styles.callItemTime}>{new Date(call.call_time).toLocaleString()}</Text>
                <Text style={styles.callItemSummary}>{call.summary || 'No summary available'}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noCallsText}>No past calls available.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  callStatusContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  durationText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  transcriptLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  transcriptScroll: {
    maxHeight: 150,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  transcriptText: {
    fontSize: 14,
    lineHeight: 20,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  limitationText: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  pastCallsContainer: {
    marginBottom: 20,
  },
  callItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
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
    color: '#444',
  },
  noCallsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  screeningIndicator: {
    marginVertical: 15,
  },
});

export default CallScreen;
