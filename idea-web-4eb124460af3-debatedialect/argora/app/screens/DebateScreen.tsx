import React, { useState } from 'react';
import { View, Button, StyleSheet, ScrollView } from 'react-native';
import DebateTree from '../components/DebateTree';
import ArgumentModal from '../components/ArgumentModal';
import { buildDebateTree, addArgument, updateVotes } from '../utils/debateTree';

const DebateScreen: React.FC = () => {
  const [debateTree, setDebateTree] = useState(buildDebateTree('Main Topic'));
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string>('root');

  const handleAddArgument = (title: string, type: 'pro' | 'con') => {
    const newTree = addArgument(debateTree, selectedParentId, title, type);
    setDebateTree({ ...newTree });
    setModalVisible(false);
  };

  const handleVote = (nodeId: string, delta: number) => {
    const newTree = updateVotes(debateTree, nodeId, delta);
    setDebateTree({ ...newTree });
  };

  const handleNodePress = (nodeId: string) => {
    setSelectedParentId(nodeId);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <DebateTree 
          tree={debateTree.root} 
          onVote={handleVote}
          onNodePress={handleNodePress}
        />
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button 
          title="Add Root Argument" 
          onPress={() => {
            setSelectedParentId('root');
            setModalVisible(true);
          }} 
        />
      </View>
      <ArgumentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddArgument}
        parentNode={debateTree.nodes[selectedParentId]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});

export default DebateScreen;
