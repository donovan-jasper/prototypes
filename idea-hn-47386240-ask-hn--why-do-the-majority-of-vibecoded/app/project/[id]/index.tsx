import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEditorStore } from '@/store/editorStore';
import Canvas from '@/components/editor/Canvas';
import ComponentPalette from '@/components/editor/ComponentPalette';
import PropertyPanel from '@/components/editor/PropertyPanel';
import ScreenNavigator from '@/components/editor/ScreenNavigator';
import { Component } from '@/types/project';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProjectEditor() {
  const { id } = useLocalSearchParams();
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
  } = useEditorStore();
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [showPalette, setShowPalette] = useState(true);
  const [showProperties, setShowProperties] = useState(true);

  useEffect(() => {
    if (id) {
      loadProjectData(id as string);
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading project...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Button mode="contained" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  if (!currentProject) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Project not found</Text>
        <Button mode="contained" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  const handleComponentSelect = (component: Component) => {
    setSelectedComponent(component);
  };

  const handleUpdateComponent = (updatedComponent: Component) => {
    // In a real app, you would update the component in the store here
    console.log('Component updated:', updatedComponent);
    setSelectedComponent(updatedComponent);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          {currentProject.name}
        </Text>
        <View style={styles.headerButtons}>
          <Button
            mode="outlined"
            onPress={() => router.push(`/project/${id}/preview`)}
            style={styles.previewButton}
          >
            Preview
          </Button>
          <Button
            mode="contained"
            onPress={() => router.push(`/project/${id}/export`)}
          >
            Export
          </Button>
        </View>
      </View>

      <ScreenNavigator
        screens={screens}
        activeScreenId={activeScreenId || ''}
        onScreenSelect={setActiveScreen}
      />

      <View style={styles.editorContainer}>
        {showPalette && (
          <View style={styles.paletteContainer}>
            <ComponentPalette onComponentSelect={handleComponentSelect} />
          </View>
        )}

        <View style={styles.canvasContainer}>
          <Canvas
            onComponentSelect={handleComponentSelect}
            selectedComponentId={selectedComponent?.id || null}
          />
        </View>

        {showProperties && selectedComponent && (
          <View style={styles.propertyPanelContainer}>
            <PropertyPanel
              component={selectedComponent}
              onUpdate={handleUpdateComponent}
            />
          </View>
        )}
      </View>

      <View style={styles.toggleButtons}>
        <Button
          mode="outlined"
          onPress={() => setShowPalette(!showPalette)}
          style={styles.toggleButton}
        >
          {showPalette ? 'Hide Palette' : 'Show Palette'}
        </Button>
        <Button
          mode="outlined"
          onPress={() => setShowProperties(!showProperties)}
          style={styles.toggleButton}
        >
          {showProperties ? 'Hide Properties' : 'Show Properties'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
    color: 'red',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewButton: {
    marginRight: 8,
  },
  editorContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  paletteContainer: {
    width: SCREEN_WIDTH * 0.3,
    height: '100%',
  },
  canvasContainer: {
    flex: 1,
    height: '100%',
  },
  propertyPanelContainer: {
    width: SCREEN_WIDTH * 0.3,
    height: '100%',
  },
  toggleButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  toggleButton: {
    marginHorizontal: 4,
  },
});
