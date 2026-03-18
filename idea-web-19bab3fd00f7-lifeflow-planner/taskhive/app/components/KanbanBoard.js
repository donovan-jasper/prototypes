import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import TaskItem from './TaskItem';

const KanbanBoard = ({ tasks, onDragEnd }) => {
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'inprogress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  const handleDragEnd = (status, { data }) => {
    const updatedData = data.map(task => ({ ...task, status }));
    const otherTasks = tasks.filter(t => t.status !== status);
    onDragEnd({ data: [...otherTasks, ...updatedData] });
  };

  const renderColumn = (title, columnTasks, status) => (
    <View style={styles.column}>
      <View style={styles.columnHeader}>
        <Text style={styles.columnTitle}>{title}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{columnTasks.length}</Text>
        </View>
      </View>
      <DraggableFlatList
        data={columnTasks}
        renderItem={({ item,
