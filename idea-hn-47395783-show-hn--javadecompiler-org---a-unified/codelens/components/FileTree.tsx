import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FileTreeProps {
  files: Array<{ path: string; content: string }>;
  onFileSelect?: (file: { path: string; content: string }) => void;
  selectedFile?: { path: string; content: string } | null;
}

const FileTree: React.FC<FileTreeProps> = ({ files, onFileSelect, selectedFile }) => {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  const buildTree = (files: Array<{ path: string; content: string }>) => {
    const tree: any = {};
    
    files.forEach(file => {
      const parts = file.path.split('/');
      let current = tree;
      
      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = {
            name: part,
            path: parts.slice(0, index + 1).join('/'),
            isFile: index === parts.length - 1,
            children: {},
            file: index === parts.length - 1 ? file : null,
          };
        }
        current = current[part].children;
      });
    });
    
    return Object.values(tree);
  };

  const toggleExpand = (path: string) => {
    setExpanded({ ...expanded, [path]: !expanded[path] });
  };

  const renderItem = (item: any, depth: number = 0) => {
    const isExpanded = expanded[item.path];
    const isSelected = selectedFile?.path === item.path;
    
    return (
      <View key={item.path}>
        <TouchableOpacity
          onPress={() => {
            if (item.isFile) {
              onFileSelect?.(item.file);
            } else {
              toggleExpand(item.path);
            }
          }}
          style={[
            styles.item,
            { paddingLeft: 8 + depth * 16 },
            isSelected && styles.selectedItem,
          ]}
        >
          <Ionicons
            name={item.isFile ? 'document-text-outline' : (isExpanded ? 'folder-open-outline' : 'folder-outline')}
            size={16}
            color={isSelected ? '#007AFF' : '#666'}
            style={styles.icon}
          />
          <Text style={[styles.itemText, isSelected && styles.selectedItemText]} numberOfLines={1}>
            {item.name}
          </Text>
        </TouchableOpacity>
        {!item.isFile && isExpanded && Object.values(item.children).map((child: any) => renderItem(child, depth + 1))}
      </View>
    );
  };

  const tree = buildTree(files);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Files</Text>
      </View>
      <FlatList
        data={tree}
        keyExtractor={(item: any) => item.path}
        renderItem={({ item }) => renderItem(item)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 8,
  },
  selectedItem: {
    backgroundColor: '#e3f2fd',
  },
  icon: {
    marginRight: 8,
  },
  itemText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  selectedItemText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default FileTree;
