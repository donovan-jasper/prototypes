import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Text, IconButton, Searchbar } from 'react-native-paper';
import { useComponentTemplates } from '@/lib/templates/componentTemplates';
import { Component } from '@/types/project';

interface ComponentPaletteProps {
  onComponentSelect: (component: Component) => void;
}

export default function ComponentPalette({ onComponentSelect }: ComponentPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const componentTemplates = useComponentTemplates();

  // Filter components based on search query
  const filteredComponents = componentTemplates.filter(template =>
    template.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group components by category
  const groupedComponents = filteredComponents.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, typeof componentTemplates>);

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search components..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView style={styles.scrollView}>
        {Object.entries(groupedComponents).map(([category, templates]) => (
          <View key={category} style={styles.categoryContainer}>
            <Text variant="titleMedium" style={styles.categoryTitle}>
              {category}
            </Text>

            <View style={styles.componentsGrid}>
              {templates.map(template => (
                <TouchableOpacity
                  key={template.type}
                  style={styles.componentItem}
                  onPress={() => {
                    // Create a new component instance with default props
                    const newComponent: Component = {
                      id: `temp_${Date.now()}`,
                      type: template.type,
                      props: template.defaultProps,
                      position: {
                        x: 0,
                        y: 0,
                        width: template.defaultPosition?.width || 'auto',
                        height: template.defaultPosition?.height || 'auto',
                      },
                      order: 0,
                    };
                    onComponentSelect(newComponent);
                  }}
                >
                  <View style={styles.componentPreview}>
                    {template.render(template.defaultProps)}
                  </View>
                  <Text style={styles.componentLabel} numberOfLines={1}>
                    {template.type.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {filteredComponents.length === 0 && (
          <View style={styles.noResults}>
            <Text>No components found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  searchBar: {
    margin: 8,
  },
  scrollView: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  categoryTitle: {
    marginBottom: 8,
    paddingLeft: 4,
    textTransform: 'capitalize',
  },
  componentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  componentItem: {
    width: '50%',
    padding: 4,
  },
  componentPreview: {
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f9f9f9',
  },
  componentLabel: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
