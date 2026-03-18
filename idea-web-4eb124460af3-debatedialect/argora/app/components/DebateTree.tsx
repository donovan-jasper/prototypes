import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DebateNode } from '../utils/debateTree';

interface DebateTreeProps {
  tree: DebateNode;
  onVote: (nodeId: string, delta: number) => void;
  onNodePress: (nodeId: string) => void;
}

const DebateTree: React.FC<DebateTreeProps> = ({ tree, onVote, onNodePress }) => {
  const renderNode = (node: DebateNode, depth: number = 0) => {
    return (
      <View key={node.id} style={[styles.node, { marginLeft: depth * 20 }]}>
        <TouchableOpacity 
          style={styles.nodeContent}
          onPress={() => onNodePress(node.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.nodeText, styles[node.type]]}>{node.title}</Text>
        </TouchableOpacity>
        
        <View style={styles.voteContainer}>
          <TouchableOpacity 
            style={styles.voteButton}
            onPress={() => onVote(node.id, 1)}
          >
            <Text style={styles.voteButtonText}>▲</Text>
          </TouchableOpacity>
          
          <Text style={styles.voteCount}>{node.votes}</Text>
          
          <TouchableOpacity 
            style={styles.voteButton}
            onPress={() => onVote(node.id, -1)}
          >
            <Text style={styles.voteButtonText}>▼</Text>
          </TouchableOpacity>
        </View>

        {node.children.map(child => renderNode(child, depth + 1))}
      </View>
    );
  };

  return <View style={styles.container}>{renderNode(tree)}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  node: {
    marginVertical: 8,
  },
  nodeContent: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ddd',
  },
  nodeText: {
    fontSize: 16,
  },
  root: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  pro: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  con: {
    color: '#c62828',
    fontWeight: '600',
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 12,
  },
  voteButton: {
    padding: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    minWidth: 36,
    alignItems: 'center',
  },
  voteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  voteCount: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
  },
});

export default DebateTree;
