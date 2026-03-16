import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import DebateTree from '../components/DebateTree';
import ArgumentModal from '../components/ArgumentModal';
import { buildDebateTree, addArgument } from '../utils/debateTree';

const DebateScreen: React.FC = () => {
  const [debateTree, setDebateTree] = useState(buildDebateTree('Main Topic'));
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddArgument = (title: string, type: 'pro' | 'con') => {
    const newTree = addArgument(debateTree, 'Main Topic', title, type);
    setDebateTree(newTree);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <DebateTree tree={debateTree.root} />
      <Button title="Add Argument" onPress={() => setModalVisible(true)} />
      <ArgumentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddArgument}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});

export default DebateScreen;
