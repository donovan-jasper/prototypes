import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DebateNode {
  id: string;
  title: string;
  type: 'root' | 'pro' | 'con';
  children: DebateNode[];
}

interface DebateTreeProps {
  tree: DebateNode;
}

const DebateTree: React.FC<DebateTreeProps> = ({ tree }) => {
  const renderNode = (node: DebateNode) => {
    return (
      <View key={node.id} style={styles.node}>
        <Text style={styles[node.type]}>{node.title}</Text>
        {node.children.map(child => renderNode(child))}
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
    marginLeft: 10,
    marginVertical: 5,
  },
  root: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  pro: {
    color: 'green',
  },
  con: {
    color: 'red',
  },
});

export default DebateTree;
