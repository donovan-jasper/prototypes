import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SecurityBadge from './SecurityBadge';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  securityScore?: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface FileTreeProps {
  files: FileNode[];
  onFileSelect: (fileId: string) => void;
  selectedFileId?: string;
}

const FileTree: React.FC<FileTreeProps> = ({ files, onFileSelect, selectedFileId }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const renderItem = ({ item }: { item: FileNode }) => {
    const isExpanded = expandedNodes.has(item.id);
    const isSelected = selectedFileId === item.id;

    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity
          style={[
            styles.item,
            isSelected && styles.selectedItem,
            item.type === 'directory' && styles.directoryItem
          ]}
          onPress={() => {
            if (item.type === 'file') {
              onFileSelect(item.id);
            } else {
              toggleExpand(item.id);
            }
          }}
        >
          <View style={styles.itemContent}>
            {item.type === 'directory' && (
              <Ionicons
                name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                size={16}
                color="#666"
                style={styles.icon}
              />
            )}
            <Text style={styles.itemText}>{item.name}</Text>
          </View>
          {item.securityScore !== undefined && item.severity && (
            <SecurityBadge score={item.securityScore} severity={item.severity} />
          )}
        </TouchableOpacity>

        {item.type === 'directory' && isExpanded && item.children && (
          <View style={styles.childrenContainer}>
            <FileTree
              files={item.children}
              onFileSelect={onFileSelect}
              selectedFileId={selectedFileId}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={files}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemContainer: {
    marginLeft: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  selectedItem: {
    backgroundColor: '#e3f2fd',
  },
  directoryItem: {
    backgroundColor: '#f5f5f5',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 14,
    marginLeft: 4,
  },
  icon: {
    marginRight: 4,
  },
  childrenContainer: {
    marginLeft: 16,
  },
});

export default FileTree;
