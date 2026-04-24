import React from 'react';
import { View, Text, FlatList } from 'react-native';
import LearningPathCard from '../../components/LearningPathCard';

const learningPaths = [
  { id: '1', title: 'Python → TensorFlow', progress: 50 },
  { id: '2', title: 'C → Embedded C++', progress: 20 },
];

const LearnScreen = () => {
  return (
    <View>
      <Text>Learning Paths</Text>
      <FlatList
        data={learningPaths}
        renderItem={({ item }) => <LearningPathCard title={item.title} progress={item.progress} />}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default LearnScreen;
