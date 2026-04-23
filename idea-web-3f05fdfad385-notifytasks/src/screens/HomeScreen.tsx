import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { TaskContext } from '../context/TaskContext';
import TaskItem from '../components/TaskItem';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { Colors } from '../constants/Colors';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const { tasks, addTask, loading, error } = useContext(TaskContext);
  const { isPremium, maxPinnedTasks } = usePremiumStatus();
  const [newTaskContent, setNewTaskContent] = useState('');
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (!isPremium) {
      const pinnedTasks = tasks.filter(task => task.isPinned);
      if (pinnedTasks.length >= maxPinnedTasks) {
        setShowPremiumPrompt(true);
      } else {
        setShowPremiumPrompt(false);
      }
    }
  }, [tasks, isPremium, maxPinnedTasks]);

  const handleAddTask = () => {
    if (newTaskContent.trim() === '') return;

    addTask({
      content: newTaskContent,
      type: 'task',
      isCompleted: false,
      isPinned: false,
      createdAt: new Date().toISOString(),
    });

    setNewTaskContent('');
  };

  const handleUpgradePress = () => {
    navigation.navigate('PremiumScreen');
  };

  const renderItem = ({ item }) => (
    <TaskItem task={item} />
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error loading tasks: {error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => {}}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aura</Text>

      {showPremiumPrompt && (
        <View style={styles.premiumPrompt}>
          <Text style={styles.premiumText}>
            You've reached your limit of pinned tasks. Upgrade to Premium to pin unlimited tasks!
          </Text>
          <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradePress}>
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          placeholderTextColor={Colors.textSecondary}
          value={newTaskContent}
          onChangeText={setNewTaskContent}
          onSubmitEditing={handleAddTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tasks yet. Add one above!</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  premiumPrompt: {
    backgroundColor: Colors.warningBackground,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  premiumText: {
    color: Colors.warningText,
    marginBottom: 8,
    textAlign: 'center',
  },
  upgradeButton: {
    backgroundColor: Colors.warningButton,
    padding: 10,
    borderRadius: 6,
    alignSelf: 'center',
  },
  upgradeButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    color: Colors.textPrimary,
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyState: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
});

export default HomeScreen;
