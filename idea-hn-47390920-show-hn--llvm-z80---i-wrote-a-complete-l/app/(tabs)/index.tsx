import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProjectManager } from '@/lib/storage/ProjectManager';
import { Project } from '@/lib/database/db';
import { COMPILATION_TARGETS, LANGUAGES } from '@/constants/targets';
import { useRouter } from 'expo-router';

export default function ProjectsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('x86');
  const [selectedLanguage, setSelectedLanguage] = useState('c');
  const [isLoading, setIsLoading] = useState(true);
  const projectManager = new ProjectManager();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    await projectManager.initialize();
    const allProjects = await projectManager.listProjects();
    setProjects(allProjects);
    setIsLoading(false);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      Alert.alert('Error', 'Please enter a project name');
      return;
    }

    try {
      await projectManager.createProject({
        name: newProjectName.trim(),
        target: selectedTarget,
        language: selectedLanguage,
      });
      setIsCreateModalVisible(false);
      setNewProjectName('');
      setSelectedTarget('x86');
      setSelectedLanguage('c');
      await loadProjects();
    } catch (error) {
      Alert.alert('Error', 'Failed to create project');
    }
  };

  const handleDeleteProject = async (id: number, name: string) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await projectManager.deleteProject(id);
            await loadProjects();
          },
        },
      ]
    );
  };

  const handleProjectPress = (project: Project) => {
    router.push('/editor');
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderProjectCard = ({ item }: { item: Project }) => {
    const target = COMPILATION_TARGETS.find((t) => t.id === item.target);
    const language = LANGUAGES.find((l) => l.id === item.language);

    return (
      <TouchableOpacity
        style={[styles.projectCard, isDark && styles.projectCardDark]}
        onPress={() => handleProjectPress(item)}
        activeOpacity={0.7}>
        <View style={styles.projectCardHeader}>
          <View style={styles.projectCardIcon}>
            <Ionicons name="code-slash" size={24} color={isDark ? '#fff' : '#000'} />
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteProject(item.id, item.name)}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.projectName, isDark && styles.textDark]}>{item.name}</Text>
        <View style={styles.projectMeta}>
          <View style={styles.metaTag}>
            <Text style={[styles.metaText, isDark && styles.metaTextDark]}>
              {target?.name || item.target.toUpperCase()}
            </Text>
          </View>
          <View style={styles.metaTag}>
            <Text style={[styles.metaText, isDark && styles.metaTextDark]}>
              {language?.name || item.language.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={[styles.projectDate, isDark && styles.textSecondaryDark]}>
          Modified {formatDate(item.updated_at)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open-outline" size={80} color={isDark ? '#555' : '#ccc'} />
      <Text style={[styles.emptyTitle, isDark && styles.textDark]}>No projects yet</Text>
      <Text style={[styles.emptySubtitle, isDark && styles.textSecondaryDark]}>
        Create your first project to start coding
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => setIsCreateModalVisible(true)}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.emptyButtonText}>Create Project</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.textDark]}>Projects</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, isDark && styles.textSecondaryDark]}>
            Loading projects...
          </Text>
        </View>
      ) : projects.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProjectCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.projectList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {projects.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsCreateModalVisible(true)}
          activeOpacity={0.8}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      <Modal
        visible={isCreateModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCreateModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark && styles.textDark]}>New Project</Text>
              <TouchableOpacity onPress={() => setIsCreateModalVisible(false)}>
                <Ionicons name="close" size={28} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, isDark && styles.textDark]}>Project Name</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={newProjectName}
              onChangeText={setNewProjectName}
              placeholder="My Awesome Project"
              placeholderTextColor={isDark ? '#666' : '#999'}
              autoFocus
            />

            <Text style={[styles.label, isDark && styles.textDark]}>Target Architecture</Text>
            <View style={styles.optionsGrid}>
              {COMPILATION_TARGETS.slice(0, 6).map((target) => (
                <TouchableOpacity
                  key={target.id}
                  style={[
                    styles.optionCard,
                    selectedTarget === target.id && styles.optionCardSelected,
                    isDark && styles.optionCardDark,
                    selectedTarget === target.id && isDark && styles.optionCardSelectedDark,
                  ]}
                  onPress={() => setSelectedTarget(target.id)}>
                  <Text
                    style={[
                      styles.optionTitle,
                      selectedTarget === target.id && styles.optionTitleSelected,
                      isDark && styles.textDark,
                    ]}>
                    {target.name}
                  </Text>
                  {target.isPremium && (
                    <View style={styles.premiumBadge}>
                      <Text style={styles.premiumText}>PRO</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, isDark && styles.textDark]}>Language</Text>
            <View style={styles.languageButtons}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.id}
                  style={[
                    styles.languageButton,
                    selectedLanguage === lang.id && styles.languageButtonSelected,
                    isDark && styles.languageButtonDark,
                    selectedLanguage === lang.id && isDark && styles.languageButtonSelectedDark,
                  ]}
                  onPress={() => setSelectedLanguage(lang.id)}>
                  <Text
                    style={[
                      styles.languageButtonText,
                      selectedLanguage === lang.id && styles.languageButtonTextSelected,
                      isDark && styles.textDark,
                    ]}>
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.createButton} onPress={handleCreateProject}>
              <Text style={styles.createButtonText}>Create Project</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  projectList: {
    padding: 20,
    paddingTop: 0,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  projectCardDark: {
    backgroundColor: '#2a2a2a',
  },
  projectCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    padding: 8,
  },
  projectName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  projectMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  metaTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  metaTextDark: {
    color: '#aaa',
  },
  projectDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalContentDark: {
    backgroundColor: '#2a2a2a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000',
  },
  inputDark: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardDark: {
    backgroundColor: '#1a1a1a',
  },
  optionCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FF',
  },
  optionCardSelectedDark: {
    borderColor: '#0A84FF',
    backgroundColor: '#1a3a5a',
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  optionTitleSelected: {
    color: '#007AFF',
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageButtonDark: {
    backgroundColor: '#1a1a1a',
  },
  languageButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FF',
  },
  languageButtonSelectedDark: {
    borderColor: '#0A84FF',
    backgroundColor: '#1a3a5a',
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  languageButtonTextSelected: {
    color: '#007AFF',
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
