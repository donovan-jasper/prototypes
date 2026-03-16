import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { getProjects } from '../../lib/database';
import ProjectCard from '../../components/ProjectCard';

const ProjectsScreen = () => {
  const [projects, setProjects] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const loadProjects = async () => {
      const projects = await getProjects();
      setProjects(projects);
    };
    loadProjects();
  }, []);

  const handleCreateProject = () => {
    router.push('/(tabs)/editor');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProjectCard project={item} />}
      />
      <TouchableOpacity style={styles.fab} onPress={handleCreateProject}>
        {/* Add icon here */}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});

export default ProjectsScreen;
