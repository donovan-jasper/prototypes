import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProjectManager } from '@/lib/storage/ProjectManager';
import { Project } from '@/lib/database/db';
import { CompilerEngine, CompilationTarget } from '@/lib/compiler/CompilerEngine';
import { useNavigation } from '@react-navigation/native';

export default function EditorScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [code, setCode] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationResult, setCompilationResult] = useState<any>(null);
  const [showOutputModal, setShowOutputModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<CompilationTarget>(CompilationTarget.X86);
  const [showTargetSelector, setShowTargetSelector] = useState(false);
  const projectManager = new ProjectManager();
  const compilerEngine = new CompilerEngine();
  const codeInputRef = useRef<TextInput>(null);

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
      setSelectedTarget(allProjects[0].target as CompilationTarget);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    setCode(project.code);
    setSelectedTarget(project.target as CompilationTarget);
  };

  const handleCodeChange = async (newCode: string) => {
    setCode(newCode);
    if (currentProject) {
      await projectManager.updateProject(currentProject.id, { code: newCode });
    }
  };

  const handleCompile = async () => {
    if (!currentProject) {
      Alert.alert('No Project', 'Please select a project first');
      return;
    }

    setIsCompiling(true);
    try {
      const result = await compilerEngine.compile(code, selectedTarget);
      setCompilationResult(result);
      setShowOutputModal(true);

      if (result.success) {
        // Save the binary to the project
        if (result.binary) {
          await projectManager.updateProject(currentProject.id, {
            binary: Array.from(result.binary),
            hexDump: result.hexDump,
            assembly: result.assembly
          });
        }
      }
    } catch (error) {
      Alert.alert('Compilation Error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsCompiling(false);
    }
  };

  const handleTargetSelect = (target: CompilationTarget) => {
    setSelectedTarget(target);
    setShowTargetSelector(false);
    if (currentProject) {
      projectManager.updateProject(currentProject.id, { target });
    }
  };

  const renderTargetItem = ({ item }: { item: CompilationTarget }) => (
    <TouchableOpacity
      style={[
        styles.targetItem,
        selectedTarget === item && styles.targetItemSelected,
        isDark && styles.targetItemDark,
        selectedTarget === item && isDark && styles.targetItemSelectedDark
      ]}
      onPress={() => handleTargetSelect(item)}
    >
      <Text style={[
        styles.targetItemText,
        selectedTarget === item && styles.targetItemTextSelected,
        isDark && styles.textDark
      ]}>
        {item.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.textDark]}>Editor</Text>
        <TouchableOpacity
          style={[styles.compileButton, isCompiling && styles.compileButtonDisabled]}
          onPress={handleCompile}
          disabled={isCompiling}>
          {isCompiling ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="play" size={20} color="#fff" />
          )}
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

          <View style={styles.editorInfo}>
            <TouchableOpacity
              style={[styles.targetSelector, isDark && styles.targetSelectorDark]}
              onPress={() => setShowTargetSelector(true)}
            >
              <Text style={[styles.targetSelectorText, isDark && styles.textDark]}>
                {selectedTarget.toUpperCase()}
              </Text>
              <Ionicons name="chevron-down" size={16} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
            <Text style={[styles.editorInfoText, isDark && styles.textSecondaryDark]}>
              {currentProject?.language.toUpperCase()}
            </Text>
          </View>

          <TextInput
            ref={codeInputRef}
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
            keyboardType="default"
            returnKeyType="done"
            blurOnSubmit={false}
          />

          {/* Target Selector Modal */}
          <Modal
            visible={showTargetSelector}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowTargetSelector(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              onPress={() => setShowTargetSelector(false)}
              activeOpacity={1}
            >
              <View style={[styles.targetSelectorModal, isDark && styles.targetSelectorModalDark]}>
                <Text style={[styles.modalTitle, isDark && styles.textDark]}>
                  Select Target Architecture
                </Text>
                <FlatList
                  data={Object.values(CompilationTarget)}
                  renderItem={renderTargetItem}
                  keyExtractor={(item) => item}
                  style={styles.targetList}
                />
                <TouchableOpacity
                  style={[styles.closeButton, isDark && styles.closeButtonDark]}
                  onPress={() => setShowTargetSelector(false)}
                >
                  <Text style={[styles.closeButtonText, isDark && styles.textDark]}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Output Modal */}
          <Modal
            visible={showOutputModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowOutputModal(false)}
          >
            <View style={[styles.outputModal, isDark && styles.outputModalDark]}>
              <View style={styles.outputHeader}>
                <Text style={[styles.outputTitle, isDark && styles.textDark]}>
                  Compilation Output
                </Text>
                <TouchableOpacity
                  onPress={() => setShowOutputModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={isDark ? '#fff' : '#000'} />
                </TouchableOpacity>
              </View>

              {compilationResult && (
                <ScrollView style={styles.outputContent}>
                  {compilationResult.success ? (
                    <>
                      <Text style={[styles.outputSectionTitle, isDark && styles.textDark]}>
                        Hex Dump
                      </Text>
                      <Text style={[styles.outputText, isDark && styles.textSecondaryDark]}>
                        {compilationResult.hexDump || 'No hex dump available'}
                      </Text>

                      {compilationResult.assembly && (
                        <>
                          <Text style={[styles.outputSectionTitle, isDark && styles.textDark]}>
                            Assembly
                          </Text>
                          <Text style={[styles.outputText, isDark && styles.textSecondaryDark]}>
                            {compilationResult.assembly}
                          </Text>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Text style={[styles.outputSectionTitle, isDark && styles.textDark]}>
                        Errors
                      </Text>
                      {compilationResult.errors.map((error: any, index: number) => (
                        <View key={index} style={styles.errorItem}>
                          <Text style={[styles.errorLine, isDark && styles.textSecondaryDark]}>
                            Line {error.line}, Column {error.column}
                          </Text>
                          <Text style={[styles.errorMessage, isDark && styles.textDark]}>
                            {error.message}
                          </Text>
                        </View>
                      ))}
                    </>
                  )}

                  <Text style={[styles.outputSectionTitle, isDark && styles.textDark]}>
                    Logs
                  </Text>
                  <Text style={[styles.outputText, isDark && styles.textSecondaryDark]}>
                    {compilationResult.logs.join('\n')}
                  </Text>
                </ScrollView>
              )}

              <View style={styles.outputActions}>
                <TouchableOpacity
                  style={[styles.outputActionButton, isDark && styles.outputActionButtonDark]}
                  onPress={() => {
                    setShowOutputModal(false);
                    navigation.navigate('output' as never, {
                      result: compilationResult,
                      projectId: currentProject?.id
                    } as never);
                  }}
                >
                  <Text style={[styles.outputActionText, isDark && styles.textDark]}>
                    View in Output Tab
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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
    color: '#aaa',
  },
  compileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  compileButtonDisabled: {
    backgroundColor: '#8BC34A',
  },
  compileButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  projectTabs: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#e0e0e0',
  },
  projectTab: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  projectTabActive: {
    backgroundColor: '#4CAF50',
  },
  projectTabDark: {
    backgroundColor: '#333',
  },
  projectTabActiveDark: {
    backgroundColor: '#4CAF50',
  },
  projectTabText: {
    color: '#666',
  },
  projectTabTextActive: {
    color: '#fff',
  },
  editorInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e0e0e0',
  },
  editorInfoText: {
    color: '#666',
  },
  codeEditor: {
    flex: 1,
    padding: 15,
    fontFamily: 'monospace',
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#000',
  },
  codeEditorDark: {
    backgroundColor: '#2d2d2d',
    color: '#fff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#333',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
  },
  targetSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  targetSelectorDark: {
    backgroundColor: '#333',
  },
  targetSelectorText: {
    marginRight: 5,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetSelectorModal: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  targetSelectorModalDark: {
    backgroundColor: '#2d2d2d',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
  },
  targetList: {
    marginBottom: 15,
  },
  targetItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  targetItemDark: {
    borderBottomColor: '#333',
  },
  targetItemSelected: {
    backgroundColor: '#e0e0e0',
  },
  targetItemSelectedDark: {
    backgroundColor: '#333',
  },
  targetItemText: {
    color: '#000',
  },
  targetItemTextSelected: {
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  closeButtonDark: {
    backgroundColor: '#333',
  },
  closeButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  outputModal: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  outputModalDark: {
    backgroundColor: '#1a1a1a',
  },
  outputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  outputTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  outputContent: {
    flex: 1,
  },
  outputSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#000',
  },
  outputText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
  },
  errorItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 5,
  },
  errorLine: {
    fontSize: 12,
    color: '#f44336',
    marginBottom: 3,
  },
  errorMessage: {
    fontSize: 14,
    color: '#000',
  },
  outputActions: {
    marginTop: 15,
  },
  outputActionButton: {
    padding: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
  },
  outputActionButtonDark: {
    backgroundColor: '#4CAF50',
  },
  outputActionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
