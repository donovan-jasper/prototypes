import { View, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, FAB, ActivityIndicator, IconButton } from 'react-native-paper';
import { useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useRouter } from 'expo-router';
import type { Project } from '@/types/project';

export default function ProjectsScreen() {
  const { projects, loading, loadProjects, removeProject } = useProjectStore();
  const router = useRouter();

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = (project: Project) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeProject(project.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete project');
            }
          },
        },
      ]
    );
  };

  const renderProject = ({ item }: { item: Project }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text variant="titleMedium" style={styles.projectName}>
              {item.name}
            </Text>
            {item.appType && (
              <Text variant="bodySmall" style={styles.appType}>
                {item.appType}
              </Text>
            )}
          </View>
          <IconButton
            icon="delete"
            size={20}
            onPress={() => handleDelete(item)}
          />
        </View>
        {item.description && (
          <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <Text variant="bodySmall" style={styles.date}>
          Updated {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
      </Card.Content>
    </Card>
  );

  if (loading && projects.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {projects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="folder-open" size={64} color="#ccc" />
          <Text variant="titleMedium" style={styles.emptyText}>
            No projects yet
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Tap the + button to create your first project
          </Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProject}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          numColumns={2}
        />
      )}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/(tabs)/create')}
      />
    </View>
  );
}

const MaterialCommunityIcons = require('@expo/vector-icons/MaterialCommunityIcons').default;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    color: '#666',
  },
  emptySubtext: {
    marginTop: 8,
    color: '#999',
    textAlign: 'center',
  },
  listContent: {
    padding: 8,
  },
  card: {
    flex: 1,
    margin: 8,
    maxWidth: '46%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardInfo: {
    flex: 1,
  },
  projectName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appType: {
    color: '#6200ee',
    textTransform: 'capitalize',
  },
  description: {
    color: '#666',
    marginBottom: 8,
  },
  date: {
    color: '#999',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#6200ee',
  },
});
