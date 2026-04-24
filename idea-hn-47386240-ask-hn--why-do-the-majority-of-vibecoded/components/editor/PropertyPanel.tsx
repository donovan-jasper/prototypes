import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput as RNTextInput } from 'react-native';
import { Text, TextInput, Button, Switch, Chip, IconButton } from 'react-native-paper';
import { Component } from '@/types/project';
import { useComponentTemplates } from '@/lib/templates/componentTemplates';

interface PropertyPanelProps {
  component: Component | null;
  onUpdate: (updatedComponent: Component) => void;
}

export default function PropertyPanel({ component, onUpdate }: PropertyPanelProps) {
  const [props, setProps] = useState<Record<string, any>>({});
  const componentTemplates = useComponentTemplates();

  useEffect(() => {
    if (component) {
      setProps(component.props);
    }
  }, [component]);

  if (!component) {
    return (
      <View style={styles.emptyContainer}>
        <Text>Select a component to edit its properties</Text>
      </View>
    );
  }

  const template = componentTemplates.find(t => t.type === component.type);
  if (!template) {
    return (
      <View style={styles.emptyContainer}>
        <Text>Unknown component type: {component.type}</Text>
      </View>
    );
  }

  const handlePropChange = (key: string, value: any) => {
    const updatedProps = { ...props, [key]: value };
    setProps(updatedProps);

    // Update the component in the parent
    onUpdate({
      ...component,
      props: updatedProps,
    });
  };

  const renderPropControl = (key: string, value: any, type?: string) => {
    // Determine the type if not provided
    const propType = type || typeof value;

    switch (propType) {
      case 'string':
        return (
          <TextInput
            key={key}
            label={key.replace('_', ' ')}
            value={value}
            onChangeText={(text) => handlePropChange(key, text)}
            mode="outlined"
            style={styles.input}
          />
        );
      case 'number':
        return (
          <TextInput
            key={key}
            label={key.replace('_', ' ')}
            value={value.toString()}
            onChangeText={(text) => handlePropChange(key, parseFloat(text) || 0)}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />
        );
      case 'boolean':
        return (
          <View key={key} style={styles.booleanControl}>
            <Text>{key.replace('_', ' ')}</Text>
            <Switch
              value={value}
              onValueChange={(checked) => handlePropChange(key, checked)}
            />
          </View>
        );
      case 'color':
        return (
          <View key={key} style={styles.colorControl}>
            <Text>{key.replace('_', ' ')}</Text>
            <View style={[styles.colorPreview, { backgroundColor: value }]} />
            <RNTextInput
              style={styles.colorInput}
              value={value}
              onChangeText={(text) => handlePropChange(key, text)}
              placeholder="#RRGGBB"
            />
          </View>
        );
      case 'array':
        return (
          <View key={key} style={styles.arrayControl}>
            <Text>{key.replace('_', ' ')}</Text>
            {value.map((item: any, index: number) => (
              <View key={`${key}-${index}`} style={styles.arrayItem}>
                <TextInput
                  value={typeof item === 'object' ? JSON.stringify(item) : item.toString()}
                  onChangeText={(text) => {
                    const newArray = [...value];
                    newArray[index] = text;
                    handlePropChange(key, newArray);
                  }}
                  mode="outlined"
                  style={styles.arrayInput}
                />
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => {
                    const newArray = [...value];
                    newArray.splice(index, 1);
                    handlePropChange(key, newArray);
                  }}
                />
              </View>
            ))}
            <Button
              mode="outlined"
              onPress={() => {
                const newArray = [...value, ''];
                handlePropChange(key, newArray);
              }}
              style={styles.addButton}
            >
              Add Item
            </Button>
          </View>
        );
      default:
        return (
          <TextInput
            key={key}
            label={key.replace('_', ' ')}
            value={JSON.stringify(value)}
            onChangeText={(text) => {
              try {
                const parsed = JSON.parse(text);
                handlePropChange(key, parsed);
              } catch (e) {
                // Keep the original value if parsing fails
              }
            }}
            mode="outlined"
            style={styles.input}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.title}>
          {component.type.replace('_', ' ')}
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          {template.description}
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {Object.entries(props).map(([key, value]) => (
          <View key={key} style={styles.propContainer}>
            {renderPropControl(key, value)}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  subtitle: {
    color: '#666',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  propContainer: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  booleanControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorControl: {
    marginBottom: 8,
  },
  colorPreview: {
    width: 30,
    height: 30,
    borderRadius: 4,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  colorInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 8,
    marginTop: 8,
  },
  arrayControl: {
    marginBottom: 8,
  },
  arrayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  arrayInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    marginTop: 8,
  },
});
