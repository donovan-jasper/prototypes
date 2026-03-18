import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Text, ActivityIndicator, Appbar, Button, Dialog, Portal, TextInput } from 'react-native-paper';
import { useEditorStore } from '@/store/editorStore';
import Canvas from '@/components/editor/Canvas';
import ScreenNavigator from '@/components/editor/ScreenNavigator';

export default function ProjectEditorScreen() {
  const { id } = useLocalSearchParams();
  const projectId = typeof id === 'string' ? id : undefined;
  const router = useRouter();

  const {
    currentProject,
    screens,
    activeScreenId,
    components,
    loading,
    error,
    loadProjectData,
    setActiveScreen,
    addScreen,
    addComponent, // For testing purposes, will be replaced by palette interaction
  } = useEditorStore();

  const [addScreenDialogVisible, setAddScreenDialogVisible] = useState(false);
  const [newScreenName, setNewScreenName] = useState('');

  useEffect(() => {
    if (projectId) {
      loadProjectData(projectId);
    } else {
      Alert.alert('Error', 'Project ID is missing.');
      router.back();
    }
  }, [projectId]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const handleAddScreen = async () => {
    if (!newScreenName.trim()) {
      Alert.alert('Error', 'Screen name cannot be empty.');
      return;
    }
    if (currentProject) {
      const screen = await addScreen(newScreenName.trim());
      if (screen) {
        setNewScreenName('');
        setAddScreenDialogVisible(false);
        // Optionally set the new screen as active
        setActiveScreen(screen.id);
      }
    }
  };

  // Temporary function to add a component for testing
  const handleAddComponentToCanvas = async () => {
    if (activeScreenId) {
      await addComponent(
        activeScreenId,
        'button', // Example component type
        { label: 'New Button', variant: 'primary' },
        { x: 0, y: 0 },
        components.length
      );
    } else {
      Alert.alert('Error', 'No active screen to add components to.');
    }
  };

  if (loading && !currentProject) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading project...</Text>
      </View>
    );
  }

  if (!currentProject) {
    return (
      <View style={styles.centerContainer}>
        <Text>Project not found or failed to load.</Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: currentProject.name,
          headerRight: () => (
            <Appbar.Action icon="eye" onPress={() => Alert.alert('Preview', 'Coming soon!')} />
          ),
        }}
      />

      <ScreenNavigator
        screens={screens}
        activeScreenId={activeScreenId}
        onSelectScreen={setActiveScreen}
        onAddScreen={() => setAddScreenDialogVisible(true)}
      />

      <Canvas components={components} />

      {/* Temporary button to add components for testing */}
      <Button
        mode="contained"
        onPress={handleAddComponentToCanvas}
        style={styles.addComponentButton}
        disabled={!activeScreenId || loading}
      >
        Add Example Button
      </Button>

      <Portal>
        <Dialog visible={addScreenDialogVisible} onDismiss={() => setAddScreenDialogVisible(false)}>
          <Dialog.Title>Add New Screen</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Screen Name"
              value={newScreenName}
              onChangeText={setNewScreenName}
              mode="outlined"
              placeholder="e.g., Login Screen"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddScreenDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleAddScreen}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  addComponentButton: {
    margin: 16,
  },
});
