import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { loadProject, saveProject } from '../../lib/storage';
import CodeEditor from '../../components/CodeEditor';

const EditorScreen = () => {
  const { projectId } = useLocalSearchParams();
  const router = useRouter();
  const [code, setCode] = useState(`// AssemblyScript Example
// AssemblyScript compiles to actual WebAssembly
// Use i32, i64, f32, f64 for number types

export function add(a: i32, b: i32): i32 {
  return a + b;
}

export function multiply(a: i32, b: i32): i32 {
  return a * b;
}

export function fibonacci(n: i32): i32 {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`);
  const [project, setProject] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProjectData = async () => {
      if (projectId) {
        const loadedProject = await loadProject(projectId);
        if (loadedProject) {
          setProject(loadedProject);
          setCode(loadedProject.code);
        }
      } else {
        // Create new project
        const newProject = {
          id: Date.now().toString(),
          name: 'Untitled Project',
          code: code,
          compiledJs: null,
          wasmBytes: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await saveProject(newProject);
        setProject(newProject);
      }
    };
    loadProjectData();
  }, [projectId]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleSave = async (codeToSave: string) => {
    if (project && !isSaving) {
      setIsSaving(true);
      try {
        const updatedProject = { ...project, code: codeToSave, updatedAt: Date.now() };
        await saveProject(updatedProject);
        setProject(updatedProject);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCompileAndPreview = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Cannot compile empty code');
      return;
    }

    // Save current code before compiling
    if (project) {
      const updatedProject = { 
        ...project, 
        code, 
        updatedAt: Date.now() 
      };
      await saveProject(updatedProject);
      setProject(updatedProject);
    }

    // Navigate to preview screen where actual compilation happens
    router.push({ pathname: '/(tabs)/preview', params: { projectId: project.id } });
  };

  const handleExport = () => {
    if (project) {
      Alert.alert('Export', 'Export feature coming soon!');
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
          style={styles.button} 
          onPress={handleCompileAndPreview}
        >
          <Text style={styles.buttonText}>Compile & Run</Text>
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
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default EditorScreen;
