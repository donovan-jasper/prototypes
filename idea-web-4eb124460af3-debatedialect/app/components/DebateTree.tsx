import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ArgumentNode, DebateTree } from '../utils/debateTree';

interface DebateTreeProps {
  tree: DebateTree;
  onVote: (argumentId: string, voteType: 'up' | 'down') => void;
  onAddArgument: (parentId: string, title: string, type: 'pro' | 'con') => void;
}

const DebateTreeComponent: React.FC<DebateTreeProps> = ({ tree, onVote, onAddArgument }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (nodeId: string) => {
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

  const renderNode = (node: ArgumentNode, depth: number = 0): JSX.Element => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;

    return (
      <View key={node.id} style={[styles.nodeContainer, { marginLeft: depth * 20 }]}>
        <View style={styles.nodeHeader}>
          <TouchableOpacity onPress={() => toggleNode(node.id)} style={styles.nodeTitleContainer}>
            <Text style={[styles.nodeTitle, { color: node.type === 'pro' ? '#4CAF50' : '#F44336' }]}>
              {node.title}
            </Text>
            {hasChildren && (
              <Text style={styles.expandIcon}>
                {isExpanded ? '▼' : '▶'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.voteButtons}>
            <TouchableOpacity onPress={() => onVote(node.id, 'up')} style={styles.voteButton}>
              <Text style={styles.voteText}>↑ {node.votes.up}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onVote(node.id, 'down')} style={styles.voteButton}>
              <Text style={styles.voteText}>↓ {node.votes.down}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {node.evidence && (
          <View style={styles.evidenceContainer}>
            <Text style={styles.evidenceText}>Evidence: {node.evidence}</Text>
          </View>
        )}

        {isExpanded && hasChildren && (
          <View style={styles.childrenContainer}>
            {node.children.map(child => renderNode(child, depth + 1))}
          </View>
        )}

        <View style={styles.addArgumentContainer}>
          <TouchableOpacity
            onPress={() => onAddArgument(node.id, '', 'pro')}
            style={[styles.addButton, { backgroundColor: '#4CAF50' }]}
          >
            <Text style={styles.addButtonText}>+ Pro</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onAddArgument(node.id, '', 'con')}
            style={[styles.addButton, { backgroundColor: '#F44336' }]}
          >
            <Text style={styles.addButtonText}>+ Con</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {renderNode(tree.root)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  nodeContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  nodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nodeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nodeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  expandIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  voteButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteButton: {
    padding: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  voteText: {
    fontSize: 14,
  },
  evidenceContainer: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  evidenceText: {
    fontSize: 12,
    color: '#666',
  },
  childrenContainer: {
    marginTop: 8,
  },
  addArgumentContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  addButton: {
    padding: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
  },
});

export default DebateTreeComponent;
