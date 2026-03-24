import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SQLite } from 'expo-sqlite';
import * as Contacts from 'expo-contacts';
import * as MediaLibrary from 'expo-media-library';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const db = SQLite.openDatabase('task.db');

const TaskExecutor = ({ workflow, onExecutionComplete }) => {
  const [executionStatus, setExecutionStatus] = useState('idle'); // idle, running, completed, error
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const executeStep = async (step, inputData) => {
    try {
      addLog(`Executing step: ${step.type} - ${step.label || step.id}`);
      
      let result;
      
      switch(step.type) {
        case 'filter':
          result = filterData(inputData, step.config);
          break;
        case 'transform':
          result = transformData(inputData, step.config);
          break;
        case 'action':
          result = await executeAction(step.config);
          break;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }
      
      addLog(`Step completed successfully`);
      return result;
    } catch (error) {
      addLog(`Error in step: ${error.message}`);
      throw error;
    }
  };

  const filterData = (data, config) => {
    if (!Array.isArray(data)) return [];
    
    switch(config.filterType) {
      case 'contact':
        return data.filter(item => 
          item.name?.toLowerCase().includes(config.filterValue?.toLowerCase() || '')
        );
      case 'photo':
        return data.filter(item => 
          item.filename?.toLowerCase().includes(config.filterValue?.toLowerCase() || '')
        );
      case 'file':
        return data.filter(item => 
          item.name?.toLowerCase().includes(config.filterValue?.toLowerCase() || '')
        );
      default:
        return data;
    }
  };

  const transformData = (data, config) => {
    if (!Array.isArray(data)) return [];
    
    switch(config.transformType) {
      case 'rename':
        return data.map(item => ({
          ...item,
          name: `${config.prefix || ''}${item.name || item.filename || item.displayName || 'unnamed'}${config.suffix || ''}`
        }));
      case 'sort':
        return [...data].sort((a, b) => {
          if (config.sortField === 'name') {
            return (a.name || '').localeCompare(b.name || '');
          }
          return 0;
        });
      case 'limit':
        return data.slice(0, parseInt(config.limit) || 10);
      default:
        return data;
    }
  };

  const executeAction = async (config) => {
    switch(config.actionType) {
      case 'saveContacts':
        // In a real implementation, this would save contacts to a file
        addLog(`Saving ${config.data.length} contacts`);
        return { success: true, message: `Saved ${config.data.length} contacts` };
      case 'organizePhotos':
        // In a real implementation, this would organize photos into folders
        addLog(`Organizing ${config.data.length} photos`);
        return { success: true, message: `Organized ${config.data.length} photos` };
      case 'processFiles':
        // In a real implementation, this would process files
        addLog(`Processing ${config.data.length} files`);
        return { success: true, message: `Processed ${config.data.length} files` };
      default:
        return { success: false, message: 'Unknown action' };
    }
  };

  const fetchDataForSource = async (sourceType) => {
    try {
      switch(sourceType) {
        case 'contacts':
          const { status } = await Contacts.requestPermissionsAsync();
          if (status !== 'granted') {
            throw new Error('Permission denied for contacts');
          }
          const { data } = await Contacts.getContactsAsync({
            fields: [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers],
          });
          return data;
          
        case 'photos':
          const mediaPermission = await MediaLibrary.requestPermissionsAsync();
          if (mediaPermission.status !== 'granted') {
            throw new Error('Permission denied for media library');
          }
          const assets = await MediaLibrary.getAssetsAsync({
            first: 100,
            sortBy: [['creationTime', 'desc']],
          });
          return assets.assets;
          
        case 'files':
          // For demonstration, we'll simulate file data
          return [
            { id: 1, name: 'document.pdf', size: 1024000, type: 'pdf' },
            { id: 2, name: 'image.jpg', size: 2048000, type: 'jpg' },
            { id: 3, name: 'video.mp4', size: 10485760, type: 'mp4' },
          ];
          
        default:
          return [];
      }
    } catch (error) {
      addLog(`Error fetching data from ${sourceType}: ${error.message}`);
      throw error;
    }
  };

  const executeWorkflow = async () => {
    if (!workflow || !workflow.steps || workflow.steps.length === 0) {
      Alert.alert('Error', 'No workflow steps to execute');
      return;
    }

    setExecutionStatus('running');
    setProgress(0);
    setCurrentStepIndex(-1);
    setResults([]);
    setLogs([]);

    try {
      // Get initial data from source
      addLog('Starting workflow execution...');
      let currentData = await fetchDataForSource(workflow.dataSource);

      const stepCount = workflow.steps.length;
      const stepResults = [];

      for (let i = 0; i < stepCount; i++) {
        setCurrentStepIndex(i);
        const step = workflow.steps[i];
        
        // Update progress
        const newProgress = Math.floor(((i + 1) / stepCount) * 100);
        setProgress(newProgress);

        // Execute the step
        const result = await executeStep(step, currentData);
        stepResults.push(result);
        
        // Update current data for next iteration
        currentData = result;
      }

      setResults(stepResults);
      setExecutionStatus('completed');
      addLog('Workflow execution completed successfully');
      onExecutionComplete && onExecutionComplete(true, stepResults);
    } catch (error) {
      setExecutionStatus('error');
      addLog(`Workflow execution failed: ${error.message}`);
      onExecutionComplete && onExecutionComplete(false, null);
    }
  };

  const resetExecution = () => {
    setExecutionStatus('idle');
    setCurrentStepIndex(-1);
    setProgress(0);
    setResults([]);
    setLogs([]);
  };

  const getStatusColor = () => {
    switch(executionStatus) {
      case 'running': return '#FFA500';
      case 'completed': return '#4CAF50';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task Executor</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: <Text style={[styles.statusValue, { color: getStatusColor() }]}>
            {executionStatus.charAt(0).toUpperCase() + executionStatus.slice(1)}
          </Text>
        </Text>
        
        {executionStatus === 'running' && (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="small" color="#2196F3" />
            <Text style={styles.progressText}>{progress}% Complete</Text>
          </View>
        )}
        
        {executionStatus === 'completed' && (
          <Text style={styles.successText}>✓ Execution completed successfully!</Text>
        )}
        
        {executionStatus === 'error' && (
          <Text style={styles.errorText}>✗ Execution failed. Check logs below.</Text>
        )}
      </View>

      <View style={styles.controlsContainer}>
        {executionStatus === 'idle' && (
          <TouchableOpacity 
            style={styles.executeButton} 
            onPress={executeWorkflow}
            disabled={!workflow || !workflow.steps || workflow.steps.length === 0}
          >
            <Text style={styles.executeButtonText}>Execute Workflow</Text>
          </TouchableOpacity>
        )}

        {(executionStatus === 'completed' || executionStatus === 'error') && (
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={resetExecution}
          >
            <Text style={styles.resetButtonText}>Reset Execution</Text>
          </TouchableOpacity>
        )}
      </View>

      {workflow && (
        <View style={styles.workflowInfo}>
          <Text style={styles.workflowTitle}>Workflow: {workflow.name}</Text>
          <Text style={styles.workflowSteps}>Steps: {workflow.steps?.length || 0}</Text>
          <Text style={styles.workflowSource}>Source: {workflow.dataSource}</Text>
        </View>
      )}

      {currentStepIndex >= 0 && workflow?.steps && (
        <View style={styles.currentStepContainer}>
          <Text style={styles.currentStepLabel}>Current Step:</Text>
          <Text style={styles.currentStepValue}>
            {workflow.steps[currentStepIndex]?.label || `Step ${currentStepIndex + 1}`}
          </Text>
        </View>
      )}

      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Execution Logs:</Text>
        <ScrollView style={styles.logsScrollView}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logEntry}>{log}</Text>
          ))}
          {logs.length === 0 && (
            <Text style={styles.noLogsText}>No logs yet. Start execution to see logs here.</Text>
          )}
        </ScrollView>
      </View>

      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Results:</Text>
          <Text style={styles.resultsText}>Final dataset contains {results[results.length - 1]?.length || 0} items</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 8,
  },
  statusValue: {
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    marginLeft: 8,
    fontSize: 14,
  },
  successText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 8,
  },
  errorText: {
    color: '#F44336',
    fontWeight: 'bold',
    marginTop: 8,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  executeButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  executeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  workflowInfo: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  workflowTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  workflowSteps: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  workflowSource: {
    fontSize: 14,
    color: '#666',
  },
  currentStepContainer: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currentStepLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  currentStepValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  logsContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  logsScrollView: {
    flex: 1,
  },
  logEntry: {
    fontSize: 12,
    fontFamily: 'monospace',
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  noLogsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  resultsContainer: {
    marginTop: 16,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
  },
});

export default TaskExecutor;
