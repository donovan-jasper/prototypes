import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { loadProject, saveProject } from '../../lib/storage';
import CodeEditor from '../../components/CodeEditor';
import { compileTypeScriptToWasm } from '../../lib/compiler';

const EditorScreen = () => {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationProgress, setCompilationProgress] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!projectId) {
          setError('No project ID provided');
          return;
        }

        const loadedProject = await loadProject(projectId);
        if (!loadedProject) {
          setError('Project not found');
          return;
        }

        setProject(loadedProject);
      } catch (err) {
        setError(err.message || 'Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleSave = async () => {
    if (!project) return;

    setIsSaving(true);
    try {
      await saveProject(project);
      Alert.alert('Success', 'Project saved successfully');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompile = async (code: string) => {
    setIsCompiling(true);
    setCompilationProgress(0);

    try {
      const result = await compileTypeScriptToWasm(code);

      if (result.success && result.wasmBytes) {
        // Update project with new WASM bytes
        const updatedProject = {
          ...project,
          wasmBytes: Array.from(result.wasmBytes),
          updatedAt: Date.now()
        };

        setProject(updatedProject);
        await saveProject(updatedProject);

        Alert.alert('Success', 'Compilation completed successfully');
      } else {
        Alert.alert('Compilation Error', result.error || 'Unknown compilation error');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Compilation failed');
    } finally {
      setIsCompiling(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007acc" />
        <Text style={styles.loadingText}>Loading project...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Project not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.title}>{project.name}</Text>
        <View style={styles.toolbarButtons}>
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.toolbarButtonText}>Save</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolbarButton, styles.previewButton]}
            onPress={() => router.push({
              pathname: '/preview',
              params: { projectId: project.id }
            })}
          >
            <Text style={styles.toolbarButtonText}>Preview</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CodeEditor
        initialCode={project.code}
        onCompile={handleCompile}
        onProgress={(progress) => setCompilationProgress(progress)}
      />

      {isCompiling && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Compiling: {compilationProgress}%</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  toolbarButtons: {
    flexDirection: 'row',
  },
  toolbarButton: {
    backgroundColor: '#007acc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 10,
  },
  previewButton: {
    backgroundColor: '#4CAF50',
  },
  toolbarButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: '#252526',
  },
  progressText: {
    color: '#fff',
    textAlign: 'center',
  },
});

export default EditorScreen;
