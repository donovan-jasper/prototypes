import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { loadProject, saveProject } from '../../lib/storage';
import { compileTypeScriptToWasm } from '../../lib/compiler';
import CodeEditor from '../../components/CodeEditor';

const EditorScreen = () => {
  const { projectId } = useLocalSearchParams();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [project, setProject] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);

  useEffect(() => {
    const loadProjectData = async () => {
      if (projectId) {
        const loadedProject = await loadProject(projectId);
        setProject(loadedProject);
        setCode(loadedProject.code);
      }
    };
    loadProjectData();
  }, [projectId]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleSave = async (codeToSave: string) => {
    if (project) {
      const updatedProject = { ...project, code: codeToSave, updatedAt: Date.now() };
      await saveProject(updatedProject);
      setProject(updatedProject);
    }
  };

  const handleCompile = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Cannot compile empty code');
      return;
    }

    setIsCompiling(true);
    try {
      const result = await compileTypeScriptToWasm(code);
      if (result.success) {
        const updatedProject = { ...project, code, wasmBytes: result.wasmBytes, updatedAt: Date.now() };
        await saveProject(updatedProject);
        setProject(updatedProject);
        Alert.alert('Success', 'Code compiled successfully!');
      } else {
        Alert.alert('Compilation Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', `Compilation failed: ${error.message}`);
    } finally {
      setIsCompiling(false);
    }
  };

  const handlePreview = () => {
    if (project) {
      router.push({ pathname: '/(tabs)/preview', params: { projectId: project.id } });
    }
  };

  const handleExport = () => {
    if (project) {
      router.push({ pathname: '/export', params: { projectId: project.id } });
    }
  };

  return (
    <View style={styles.container}>
      <CodeEditor 
        code={code} 
        onChange={handleCodeChange} 
        onSave={handleSave} 
      />
      <View style={styles.toolbar}>
        <TouchableOpacity 
          style={[styles.button, isCompiling && styles.disabledButton]} 
          onPress={handleCompile}
          disabled={isCompiling}
        >
          <Text style={styles.buttonText}>
            {isCompiling ? 'Compiling...' : 'Compile'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handlePreview}
        >
          <Text style={styles.buttonText}>Preview</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleExport}
        >
          <Text style={styles.buttonText}>Export</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  button: {
    padding: 12,
    backgroundColor: '#6200ee',
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default EditorScreen;
