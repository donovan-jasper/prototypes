import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { TaskProvider } from './contexts/TaskContext';
import TaskScreen from './screens/TaskScreen';

export default function App() {
  return (
    <TaskProvider>
      <SafeAreaView style={styles.container}>
        <TaskScreen />
      </SafeAreaView>
    </TaskProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
