import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProjectManager } from '@/lib/storage/ProjectManager';
import { Project } from '@/lib/database/db';

export default function EditorScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [code, setCode] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const projectManager = new ProjectManager();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    await projectManager.initialize();
    const allProjects = await projectManager.listProjects();
    setProjects(allProjects);
    if (allProjects.length > 0 && !currentProject) {
      setCurrentProject(allProjects[0]);
      setCode(allProjects[0].code);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    setCode(project.code);
  };

  const handleCodeChange = async (newCode: string) => {
    setCode(newCode);
    if (currentProject) {
      await projectManager.updateProject(currentProject.id, { code: newCode });
    }
  };

  const handleCompile = () => {
    if (!currentProject) {
      Alert.alert('No Project', 'Please select a project first');
      return;
    }

    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      Alert.alert('Compilation', 'Compilation feature coming soon!');
    }, 1500);
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.textDark]}>Editor</Text>
        <TouchableOpacity
          style={[styles.compileButton, isCompiling && styles.compileButtonDisabled]}
          onPress={handleCompile}
          disabled={isCompiling}>
          <Ionicons name="play" size={20} color="#fff" />
          <Text style={styles.compileButtonText}>
            {isCompiling ? 'Compiling...' : 'Compile'}
          </Text>
        </TouchableOpacity>
      </View>

      {projects.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="code-slash-outline" size={64} color={isDark ? '#555' : '#ccc'} />
          <Text style={[styles.emptyText, isDark && styles.textSecondaryDark]}>
            No projects yet
          </Text>
          <Text style={[styles.emptySubtext, isDark && styles.textSecondaryDark]}>
            Create a project in the Projects tab
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            style={styles.projectTabs}
            showsHorizontalScrollIndicator={false}>
            {projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={[
                  styles.projectTab,
                  currentProject?.id === project.id && styles.projectTabActive,
                  isDark && styles.projectTabDark,
                  currentProject?.id === project.id && isDark && styles.projectTabActiveDark,
                ]}
                onPress={() => handleProjectSelect(project)}>
                <Text
                  style={[
                    styles.projectTabText,
                    currentProject?.id === project.id && styles.projectTabTextActive,
                    isDark && styles.textDark,
                  ]}>
                  {project.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {currentProject && (
            <View style={styles.editorInfo}>
              <Text style={[styles.editorInfoText, isDark && styles.textSecondaryDark]}>
                {currentProject.target.toUpperCase()} • {currentProject.language.toUpperCase()}
              </Text>
            </View>
          )}

          <TextInput
            style={[styles.codeEditor, isDark && styles.codeEditorDark]}
            value={code}
            onChangeText={handleCodeChange}
            multiline
            placeholder="Start coding..."
            placeholderTextColor={isDark ? '#555' : '#999'}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            textAlignVertical="top"
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  textDark: {
    color: '#fff',
  },
  textSecondaryDark: {
    color: '#888',
  },
  compileButton: {
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  compileButtonDisabled: {
    opacity: 0.6,
  },
  compileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  projectTabs: {
    flexGrow: 0,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  projectTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#e0e0e0',
  },
  projectTabDark: {
    backgroundColor: '#2a2a2a',
  },
  projectTabActive: {
    backgroundColor: '#007AFF',
  },
  projectTabActiveDark: {
    backgroundColor: '#0A84FF',
  },
  projectTabText: {
    fontSize: 14,
    color: '#666',
  },
  projectTabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  editorInfo: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  editorInfoText: {
    fontSize: 12,
    color: '#666',
  },
  codeEditor: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    fontFamily: 'Courier',
    color: '#000',
  },
  codeEditorDark: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
