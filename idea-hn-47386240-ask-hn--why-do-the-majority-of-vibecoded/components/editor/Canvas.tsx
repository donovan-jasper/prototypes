import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Component } from '@/types/project';
import { Card, Button, TextInput } from 'react-native-paper'; // Example components

interface CanvasProps {
  components: Component[];
}

// A very basic renderer for now. In a real app, this would dynamically render based on component.type
const renderComponent = (component: Component) => {
  switch (component.type) {
    case 'button':
      return (
        <Button key={component.id} mode="contained" style={styles.canvasComponent}>
          {(component.props as { label?: string }).label || 'Button'}
        </Button>
      );
    case 'text':
      return (
        <Text key={component.id} style={styles.canvasComponent}>
          {(component.props as { content?: string }).content || 'Text Label'}
        </Text>
      );
    case 'input':
      return (
        <TextInput
          key={component.id}
          label={(component.props as { label?: string }).label || 'Input'}
          mode="outlined"
          style={styles.canvasComponent}
          editable={false} // Not interactive in editor
        />
      );
    case 'card':
      return (
        <Card key={component.id} style={styles.canvasComponent}>
          <Card.Title title={(component.props as { title?: string }).title || 'Card Title'} />
          <Card.Content>
            <Text>{(component.props as { content?: string }).content || 'Card content'}</Text>
          </Card.Content>
        </Card>
      );
    default:
      return (
        <View key={component.id} style={[styles.canvasComponent, styles.defaultComponent]}>
          <Text style={styles.defaultComponentText}>{component.type}</Text>
        </View>
      );
  }
};

export default function Canvas({ components }: CanvasProps) {
  return (
    <View style={styles.canvas} testID="canvas">
      {components.length === 0 ? (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>Tap to add components</Text>
        </View>
      ) : (
        components.map(renderComponent)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    margin: 16,
    padding: 16,
    alignItems: 'center', // Center components for now
    justifyContent: 'center', // Center components for now
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: '#aaa',
  },
  canvasComponent: {
    marginVertical: 8, // Basic spacing
    width: '80%', // Example width
  },
  defaultComponent: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultComponentText: {
    color: '#666',
  },
});
