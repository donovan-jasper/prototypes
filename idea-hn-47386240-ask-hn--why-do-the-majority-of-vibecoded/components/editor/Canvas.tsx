import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, PanResponder, Dimensions, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useEditorStore } from '@/store/editorStore';
import { useComponentTemplates } from '@/lib/templates/componentTemplates';
import { Component } from '@/types/project';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CanvasProps {
  onComponentSelect: (component: Component) => void;
  selectedComponentId: string | null;
}

export default function Canvas({ onComponentSelect, selectedComponentId }: CanvasProps) {
  const { components, activeScreenId, addComponent } = useEditorStore();
  const [canvasSize, setCanvasSize] = useState({ width: SCREEN_WIDTH, height: 800 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragComponent, setDragComponent] = useState<Component | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const componentTemplates = useComponentTemplates();
  const scrollViewRef = useRef<ScrollView>(null);

  // Handle component drop
  const handleDrop = (x: number, y: number) => {
    if (!dragComponent) return;

    // Convert canvas coordinates to relative position
    const relativeX = (x / canvasSize.width) * 100;
    const relativeY = (y / canvasSize.height) * 100;

    // Find the highest order number in the current components
    const maxOrder = components.reduce((max, comp) => Math.max(max, comp.order), 0);

    // Add the component to the store
    addComponent(
      activeScreenId!,
      dragComponent.type,
      dragComponent.props,
      {
        x: relativeX,
        y: relativeY,
        width: dragComponent.position.width || 'auto',
        height: dragComponent.position.height || 'auto',
      },
      maxOrder + 1
    );

    setDragComponent(null);
    setIsDragging(false);
  };

  // Pan responder for handling component dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (isDragging && dragComponent) {
          setDragPosition({
            x: gestureState.moveX,
            y: gestureState.moveY,
          });
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (isDragging && dragComponent) {
          // Calculate the position relative to the canvas
          const canvasX = gestureState.moveX;
          const canvasY = gestureState.moveY;

          handleDrop(canvasX, canvasY);
        }
      },
    })
  ).current;

  // Render a component on the canvas
  const renderComponent = (component: Component) => {
    const template = componentTemplates.find(t => t.type === component.type);
    if (!template) return null;

    // Calculate absolute position based on relative values
    const position = {
      left: component.position.x ? (component.position.x / 100) * canvasSize.width : 0,
      top: component.position.y ? (component.position.y / 100) * canvasSize.height : 0,
      width: component.position.width ? (component.position.width / 100) * canvasSize.width : 'auto',
      height: component.position.height ? (component.position.height / 100) * canvasSize.height : 'auto',
    };

    const isSelected = selectedComponentId === component.id;

    return (
      <View
        key={component.id}
        style={[
          styles.componentContainer,
          position,
          isSelected && styles.selectedComponent,
        ]}
        onStartShouldSetResponder={() => true}
        onResponderGrant={() => onComponentSelect(component)}
      >
        {template.render(component.props)}
        {isSelected && (
          <View style={styles.selectionHandles}>
            <View style={[styles.handle, styles.topLeft]} />
            <View style={[styles.handle, styles.topRight]} />
            <View style={[styles.handle, styles.bottomLeft]} />
            <View style={[styles.handle, styles.bottomRight]} />
          </View>
        )}
      </View>
    );
  };

  // Render the dragged component preview
  const renderDragPreview = () => {
    if (!dragComponent || !isDragging) return null;

    const template = componentTemplates.find(t => t.type === dragComponent.type);
    if (!template) return null;

    return (
      <View
        style={[
          styles.dragPreview,
          {
            left: dragPosition.x - 50,
            top: dragPosition.y - 50,
          },
        ]}
        pointerEvents="none"
      >
        {template.render(dragComponent.props)}
      </View>
    );
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { width: canvasSize.width, height: canvasSize.height }]}
        showsVerticalScrollIndicator={true}
        showsHorizontalScrollIndicator={true}
      >
        {components.map(renderComponent)}

        {components.length === 0 && (
          <View style={styles.emptyCanvas}>
            <Text style={styles.emptyText}>Tap to add components from the palette</Text>
          </View>
        )}
      </ScrollView>

      {renderDragPreview()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    position: 'relative',
  },
  componentContainer: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 4,
  },
  selectedComponent: {
    borderColor: '#6200ee',
    borderWidth: 2,
  },
  selectionHandles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: '#6200ee',
    borderRadius: 4,
  },
  handle: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: '#6200ee',
    borderRadius: 5,
  },
  topLeft: {
    top: -5,
    left: -5,
  },
  topRight: {
    top: -5,
    right: -5,
  },
  bottomLeft: {
    bottom: -5,
    left: -5,
  },
  bottomRight: {
    bottom: -5,
    right: -5,
  },
  emptyCanvas: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
  },
  dragPreview: {
    position: 'absolute',
    opacity: 0.7,
    zIndex: 1000,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#6200ee',
    borderStyle: 'dashed',
  },
});
