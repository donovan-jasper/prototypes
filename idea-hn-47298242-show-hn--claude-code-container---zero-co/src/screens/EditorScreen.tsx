import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CodeEditor from '../components/CodeEditor';
import { useSession } from '../context/SessionContext';

export default function EditorScreen() {
  const { code, language, isRunning, sessionId, setCode, setLanguage, runCode } = useSession();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.languageContainer}>
          <Picker
            selectedValue={language}
            onValueChange={(value) => setLanguage(value)}
            style={styles.picker}
            dropdownIconColor="#e2e8f0"
          >
            <Picker.Item label="JavaScript" value="javascript" />
            <Picker.Item label="Python" value="python" />
            <Picker.Item label="Go" value="go" />
            <Picker.Item label="Java" value="java" />
            <Picker.Item label="C++" value="cpp" />
          </Picker>
        </View>
        
        <TouchableOpacity
          style={[styles.runButton, (isRunning || !sessionId) && styles.runButtonDisabled]}
          onPress={runCode}
          disabled={isRunning || !sessionId}
        >
          {isRunning ? (
            <>
              <ActivityIndicator size="small" color="#fff" style={styles.spinner} />
              <Text style={styles.runButtonText}>Running...</Text>
            </>
          ) : (
            <Text style={styles.runButtonText}>Run Code</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {sessionId && (
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionText}>Session: {sessionId.substring(0, 8)}...</Text>
        </View>
      )}
      
      <View style={styles.editorContainer}>
        <CodeEditor value={code} onChange={setCode} language={language} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  languageContainer: {
    backgroundColor: '#334155',
    borderRadius: 6,
    overflow: 'hidden',
    minWidth: 150,
  },
  picker: {
    color: '#e2e8f0',
    height: 40,
  },
  runButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  runButtonDisabled: {
    backgroundColor: '#64748b',
  },
  runButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  spinner: {
    marginRight: 8,
  },
  sessionInfo: {
    padding: 12,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  sessionText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  editorContainer: {
    flex: 1,
    padding: 16,
  },
});
