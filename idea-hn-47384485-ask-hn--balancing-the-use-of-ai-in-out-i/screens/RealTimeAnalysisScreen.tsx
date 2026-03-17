import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const RealTimeAnalysisScreen = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [activeConversations, setActiveConversations] = useState([]);
  const [isPremium, setIsPremium] = useState(true); // In a real app, this would come from your auth state
  const navigation = useNavigation();

  useEffect(() => {
    if (!isPremium) {
      Alert.alert(
        "Premium Feature",
        "Real-time message analysis is a premium feature. Please upgrade to use this feature.",
        [
          { text: "Cancel", onPress: () => navigation.goBack() },
          { text: "Upgrade", onPress: () => navigation.navigate('Settings') }
        ]
      );
    }
  }, []);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    if (!isMonitoring) {
      // Simulate finding active conversations
      setTimeout(() => {
        setActiveConversations([
          { id: 1, platform: 'WhatsApp', contact: 'John Doe', status: 'Human', score: 85 },
          { id: 2, platform: 'Instagram', contact: 'Jane Smith', status: 'AI', score: 25 },
          { id: 3, platform: 'Email', contact: 'HR Department', status: 'Mixed', score: 55 }
        ]);
      }, 1500);
    } else {
      setActiveConversations([]);
    }
  };

  if (!isPremium) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Real-Time Analysis</Text>
      <Text style={styles.subtitle}>Monitor messages in real-time across your devices</Text>

      <TouchableOpacity
        style={[styles.monitorButton, isMonitoring && styles.monitoringActive]}
        onPress={toggleMonitoring}
      >
        <Ionicons
          name={isMonitoring ? "stop-circle" : "play-circle"}
          size={24}
          color="white"
          style={styles.buttonIcon}
        />
        <Text style={styles.monitorButtonText}>
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </Text>
      </TouchableOpacity>

      {isMonitoring && (
        <View style={styles.statusContainer}>
          <Ionicons name="radio" size={20} color="green" />
          <Text style={styles.statusText}>Monitoring active conversations...</Text>
        </View>
      )}

      {activeConversations.length > 0 && (
        <View style={styles.conversationsContainer}>
          <Text style={styles.sectionTitle}>Active Conversations</Text>
          {activeConversations.map(conversation => (
            <View key={conversation.id} style={styles.conversationItem}>
              <View style={styles.conversationHeader}>
                <Text style={styles.contactName}>{conversation.contact}</Text>
                <Text style={styles.platformTag}>{conversation.platform}</Text>
              </View>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Score:</Text>
                <Text style={styles.scoreValue}>{conversation.score}</Text>
                <Text style={[
                  styles.statusBadge,
                  conversation.status === 'Human' ? styles.human :
                  conversation.status === 'Mixed' ? styles.mixed : styles.ai
                ]}>
                  {conversation.status}
                </Text>
              </View>
              <TouchableOpacity style={styles.detailsButton}>
                <Text style={styles.detailsButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.instructionsContainer}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <Text style={styles.instruction}>
          1. Click "Start Monitoring" to begin analyzing messages in real-time
        </Text>
        <Text style={styles.instruction}>
          2. The browser extension will monitor your active conversations
        </Text>
        <Text style={styles.instruction}>
          3. You'll receive notifications when AI-generated messages are detected
        </Text>
        <Text style={styles.instruction}>
          4. View detailed analysis of each message in the app
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  monitorButton: {
    backgroundColor: 'tomato',
    padding: 15,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  monitoringActive: {
    backgroundColor: '#ff6b6b',
  },
  buttonIcon: {
    marginRight: 10,
  },
  monitorButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statusText: {
    marginLeft: 10,
    color: 'green',
    fontWeight: 'bold',
  },
  conversationsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  conversationItem: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  platformTag: {
    backgroundColor: '#ddd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 12,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  scoreValue: {
    fontSize: 16,
    marginRight: 10,
  },
  statusBadge: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  human: {
    color: 'green',
  },
  mixed: {
    color: 'orange',
  },
  ai: {
    color: 'red',
  },
  detailsButton: {
    backgroundColor: 'tomato',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  instructionsContainer: {
    marginTop: 20,
  },
  instruction: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default RealTimeAnalysisScreen;
