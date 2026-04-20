import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import {
  connectTool,
  disconnectTool,
  getToolsWithStatus,
  initiateGoogleDriveAuth,
  listGoogleDriveFolders,
  getGoogleDriveAccessToken,
  clearGoogleDriveAccessToken,
} from '../services/ToolIntegrationService';
import { useFocusEffect } from '@react-navigation/native';

const SUPPORTED_TOOLS = ['Google Drive', 'Trello', 'GitHub', 'Slack', 'Jira'];

const ToolIntegration = () => {
  const [toolStatuses, setToolStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [googleDriveFolders, setGoogleDriveFolders] = useState([]);
  const [googleDriveLoading, setGoogleDriveLoading] = useState(false);

  const fetchToolStatuses = useCallback(async () => {
    setLoading(true);
    const statuses = await getToolsWithStatus(SUPPORTED_TOOLS);
    setToolStatuses(statuses);

    // If Google Drive is connected, try to list folders immediately
    if (statuses['Google Drive'] === 'Connected') {
      await fetchGoogleDriveFolders();
    } else {
      setGoogleDriveFolders([]); // Clear folders if not connected
    }
    setLoading(false);
  }, []);

  const fetchGoogleDriveFolders = useCallback(async () => {
    setGoogleDriveLoading(true);
    const result = await listGoogleDriveFolders();
    if (result.success) {
      setGoogleDriveFolders(result.folders);
    } else {
      Alert.alert('Error', result.error);
      setGoogleDriveFolders([]);
      // If token expired, force disconnect in UI
      if (result.error.includes('token expired')) {
        await disconnectTool('Google Drive'); // This will also clear token
        fetchToolStatuses(); // Refresh UI
      }
    }
    setGoogleDriveLoading(false);
  }, [fetchToolStatuses]);

  // Fetch statuses when component mounts and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchToolStatuses();
    }, [fetchToolStatuses])
  );

  const handleConnect = async (toolName) => {
    if (toolName === 'Google Drive') {
      setGoogleDriveLoading(true);
      const authResult = await initiateGoogleDriveAuth();
      if (authResult.success) {
        Alert.alert('Success', `${toolName} connected!`);
        await fetchToolStatuses(); // Refresh statuses and fetch folders
      } else {
        Alert.alert('Error', authResult.error || `Failed to connect ${toolName}.`);
      }
      setGoogleDriveLoading(false);
    } else {
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
    }
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
              if (toolName === 'Google Drive') {
                setGoogleDriveFolders([]); // Clear folders on disconnect
              }
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
    const isLoading = toolName === 'Google Drive' && googleDriveLoading;

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
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>
              {isConnected ? 'Disconnect' : 'Connect'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10 }}>Loading tool statuses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Tool Integrations</Text>
      <FlatList
        data={SUPPORTED_TOOLS}
        keyExtractor={(item) => item}
        renderItem={renderToolItem}
        contentContainerStyle={styles.listContent}
      />

      {toolStatuses['Google Drive'] === 'Connected' && (
        <View style={styles.googleDriveSection}>
          <Text style={styles.googleDriveHeader}>Google Drive Top-Level Folders:</Text>
          {googleDriveLoading ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : googleDriveFolders.length > 0 ? (
            <FlatList
              data={googleDriveFolders}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.folderItem}>
                  <Text style={styles.folderName}>{item.name}</Text>
                </View>
              )}
              style={styles.folderList}
            />
          ) : (
            <Text style={styles.noFoldersText}>No top-level folders found or accessible.</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    paddingTop: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
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
  googleDriveSection: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginHorizontal: 15,
    padding: 15,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleDriveHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  folderList: {
    maxHeight: 200, // Limit height for scrollability
  },
  folderItem: {
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  folderName: {
    fontSize: 14,
    color: '#555',
  },
  noFoldersText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default ToolIntegration;
