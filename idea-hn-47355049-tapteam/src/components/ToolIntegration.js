import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import {
  connectTool,
  disconnectTool,
  getToolsWithStatus,
} from '../services/ToolIntegrationService';
import { useFocusEffect } from '@react-navigation/native';

const SUPPORTED_TOOLS = ['Google Drive', 'Trello', 'GitHub', 'Slack', 'Jira'];

const ToolIntegration = () => {
  const [toolStatuses, setToolStatuses] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchToolStatuses = useCallback(async () => {
    setLoading(true);
    const statuses = await getToolsWithStatus(SUPPORTED_TOOLS);
    setToolStatuses(statuses);
    setLoading(false);
  }, []);

  // Fetch statuses when component mounts and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchToolStatuses();
    }, [fetchToolStatuses])
  );

  const handleConnect = async (toolName) => {
    Alert.alert(
      `Connect to ${toolName}`,
      `Do you want to authorize RaccoonAI to connect with ${toolName}? (Simulated)`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Connect',
          onPress: async () => {
            const success = await connectTool(toolName);
            if (success) {
              Alert.alert('Success', `${toolName} connected!`);
              fetchToolStatuses(); // Refresh statuses
            } else {
              Alert.alert('Error', `Failed to connect ${toolName}.`);
            }
          },
        },
      ]
    );
  };

  const handleDisconnect = async (toolName) => {
    Alert.alert(
      `Disconnect from ${toolName}`,
      `Are you sure you want to disconnect RaccoonAI from ${toolName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Disconnect',
          onPress: async () => {
            const success = await disconnectTool(toolName);
            if (success) {
              Alert.alert('Success', `${toolName} disconnected.`);
              fetchToolStatuses(); // Refresh statuses
            } else {
              Alert.alert('Error', `Failed to disconnect ${toolName}.`);
            }
          },
        },
      ]
    );
  };

  const renderToolItem = ({ item: toolName }) => {
    const status = toolStatuses[toolName] || 'Not Connected';
    const isConnected = status === 'Connected';

    return (
      <View style={styles.toolItem}>
        <View style={styles.toolInfo}>
          <Text style={styles.toolName}>{toolName}</Text>
          <Text style={[styles.toolStatus, isConnected ? styles.connected : styles.notConnected]}>
            Status: {status}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.button, isConnected ? styles.disconnectButton : styles.connectButton]}
          onPress={() => (isConnected ? handleDisconnect(toolName) : handleConnect(toolName))}
        >
          <Text style={styles.buttonText}>
            {isConnected ? 'Disconnect' : 'Connect'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading tool statuses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={SUPPORTED_TOOLS}
        keyExtractor={(item) => item}
        renderItem={renderToolItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  toolItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toolInfo: {
    flex: 1,
    marginRight: 10,
  },
  toolName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  toolStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  connected: {
    color: '#28a745', // Green
    fontWeight: '600',
  },
  notConnected: {
    color: '#dc3545', // Red
    fontWeight: '600',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#007bff', // Blue
  },
  disconnectButton: {
    backgroundColor: '#6c757d', // Grey
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ToolIntegration;
