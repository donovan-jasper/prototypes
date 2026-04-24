import React from 'react';
import { View, Text, FlatList } from 'react-native';
import ProjectTemplate from '../../components/ProjectTemplate';

const projectTemplates = [
  { id: '1', title: 'Deploy a TinyML model on ESP32' },
  { id: '2', title: 'Build a GAN from scratch' },
];

const ProjectsScreen = () => {
  return (
    <View>
      <Text>Project Templates</Text>
      <FlatList
        data={projectTemplates}
        renderItem={({ item }) => <ProjectTemplate title={item.title} />}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default ProjectsScreen;
