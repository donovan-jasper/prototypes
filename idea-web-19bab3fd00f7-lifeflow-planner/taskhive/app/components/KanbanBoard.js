import React from 'react';
import { View, StyleSheet } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import TaskItem from './TaskItem';

const KanbanBoard = ({ tasks, onDragEnd }) => {
  return (
    <View style={styles.container}>
      <DraggableFlatList
        data={tasks}
        renderItem={({ item, drag }) => (
          <TaskItem task={item} onLongPress={drag} />
        )}
        keyExtractor={(item) => item.id}
        onDragEnd={onDragEnd}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default KanbanBoard;
