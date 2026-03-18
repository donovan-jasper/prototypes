import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProjectManager } from '@/lib/storage/ProjectManager';
import { Project } from '@/lib/database/db';
import { COMPILATION_TARGETS } from '@/constants/targets';

export default function ProjectsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('x86');
  const [selectedLanguage, setSelectedLanguage] = useState('c');
  const projectManager = new ProjectManager();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    await projectManager.initialize();
    const allProjects = await projectManager.listProjects();
    setProjects(allProjects);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      Alert.alert('Error', 'Please enter a project name');
      return;
    }

    try {
      await projectManager.createProject({
        name: newProjectName,
        target: selectedTarget,
        language: selectedLanguage,
      });
      setNewProjectName('');
      setShowCreateModal(false);
      loadProjects();
    } catch (error) {
      Alert.alert('Error', 'Failed to create project');
    }
  };

  const handleDeleteProject = (project: Project) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await projectManager.deleteProject(project.id);
            loadProjects();
          },
        },
      ]
    );
  };

  const renderProject = ({ item }: { item: Project }) => {
    const target = COMPILATION_TARGETS.find((t) => t.id === item.target);
    const lastModified = new Date(item.updated_at).toLocaleDateString();

    return (
      <View style={[styles.projectCard, isDark && styles.projectCardDark]}>
        <View style={styles.projectHeader}>
          <Text style={[styles.projectName, isDark && styles.textDark]}>{item.name}</Text>
          <TouchableOpacity onPress={() => handleDeleteProject(item)}>
            <Ionicons name="trash-outline" size={20} color={isDark ? '#ff6b6b' : '#e74c3c'} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.projectTarget, isDark && styles.textDark]}>
          {target?.name || item.target}
        </Text>
        <Text style={[styles.projectLanguage, isDark && styles.textSecondaryDark]}>
          {item.language.toUpperCase()} • {lastModified}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.textDark]}>Projects</Text>
        <TouchableOpacity
          style={[styles.createButton, isDark && styles.createButtonDark]}
          onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {showCreateModal && (
        <View style={[styles.modal, isDark && styles.modalDark]}>
          <Text style={[styles.modalTitle, isDark && styles.textDark]}>New Project</Text>
          
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            placeholder="Project name"
            placeholderTextColor={isDark ? '#888' : '#999'}
            value={newProjectName}
            onChangeText={setNewProjectName}
          />

          <Text style={[styles.label, isDark && styles.textDark]}>Target Platform</Text>
          <View style={styles.targetGrid}>
            {COMPILATION_TARGETS.filter((t) => !t.isPremium).map((target) => (
              <TouchableOpacity
                key={target.id}
                style={[
                  styles.targetButton,
                  selectedTarget === target.id && styles.targetButtonSelected,
                  isDark && styles.targetButtonDark,
                  selectedTarget === target.id && isDark && styles.targetButtonSelectedDark,
                ]}
                onPress={() => setSelectedTarget(target.id)}>
                <Text
                  style={[
                    styles.targetButtonText,
                    selectedTarget === target.id && styles.targetButtonTextSelected,
                    isDark && styles.textDark,
                  ]}>
                  {target.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, isDark && styles.textDark]}>Language</Text>
          <View style={styles.languageRow}>
            {['c', 'cpp', 'asm'].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.languageButton,
                  selectedLanguage === lang && styles.languageButtonSelected,
                  isDark && styles.languageButtonDark,
                  selectedLanguage === lang && isDark && styles.languageButtonSelectedDark,
                ]}
                onPress={() => setSelectedLanguage(lang)}>
                <Text
                  style={[
                    styles.languageButtonText,
                    selectedLanguage === lang && styles.languageButtonTextSelected,
                    isDark && styles.textDark,
                  ]}>
                  {lang.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowCreateModal(false);
                setNewProjectName('');
              }}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleCreateProject}>
              <Text style={styles.confirmButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color={isDark ? '#555' : '#ccc'} />
            <Text style={[styles.emptyText, isDark && styles.textSecondaryDark]}>
              No projects yet
            </Text>
            <Text style={[styles.emptySubtext, isDark && styles.textSecondaryDark]}>
              Tap + to create your first project
            </Text>
          </View>
        }
      />
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
  createButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonDark: {
    backgroundColor: '#0A84FF',
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectCardDark: {
    backgroundColor: '#2a2a2a',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  projectTarget: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  projectLanguage: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
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
  modal: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalDark: {
    backgroundColor: '#2a2a2a',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  inputDark: {
    borderColor: '#444',
    backgroundColor: '#1a1a1a',
    color: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  targetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  targetButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  targetButtonDark: {
    borderColor: '#444',
    backgroundColor: '#1a1a1a',
  },
  targetButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  targetButtonSelectedDark: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },
  targetButtonText: {
    fontSize: 14,
    color: '#000',
  },
  targetButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  languageRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  languageButtonDark: {
    borderColor: '#444',
    backgroundColor: '#1a1a1a',
  },
  languageButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  languageButtonSelectedDark: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },
  languageButtonText: {
    fontSize: 14,
    color: '#000',
  },
  languageButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
