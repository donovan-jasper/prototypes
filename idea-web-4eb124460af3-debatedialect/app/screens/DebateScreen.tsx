import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Button, Alert } from 'react-native';
import DebateTree from '../components/DebateTree';
import { DebateTree as DebateTreeType, ArgumentNode } from '../utils/debateTree';
import { buildDebateTree, addArgument, voteOnArgument } from '../utils/debateTree';

const DebateScreen: React.FC = () => {
  const [debateTree, setDebateTree] = useState<DebateTreeType>(buildDebateTree('Main Topic'));
  const [newArgumentTitle, setNewArgumentTitle] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize with some sample data
    const sampleTree = buildDebateTree('Should we legalize cannabis?');
    addArgument(sampleTree, 'Should we legalize cannabis?', 'Reduces crime rates', 'pro');
    addArgument(sampleTree, 'Should we legalize cannabis?', 'Increases healthcare costs', 'con');
    setDebateTree(sampleTree);
  }, []);

  const handleAddArgument = (parentId: string, title: string, type: 'pro' | 'con') => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an argument title');
      return;
    }

    const updatedTree = { ...debateTree };
    addArgument(updatedTree, parentId, title, type);
    setDebateTree(updatedTree);
    setNewArgumentTitle('');
    setSelectedParentId(null);
  };

  const handleVote = (argumentId: string, voteType: 'up' | 'down') => {
    const updatedTree = { ...debateTree };
    voteOnArgument(updatedTree, argumentId, voteType);
    setDebateTree(updatedTree);
  };

  const handleAddArgumentClick = (parentId: string) => {
    setSelectedParentId(parentId);
  };

  return (
    <View style={styles.container}>
      <DebateTree
        tree={debateTree}
        onVote={handleVote}
        onAddArgument={handleAddArgument}
      />

      {selectedParentId && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your argument"
            value={newArgumentTitle}
            onChangeText={setNewArgumentTitle}
          />
          <View style={styles.buttonContainer}>
            <Button
              title="Add Pro"
              onPress={() => handleAddArgument(selectedParentId!, newArgumentTitle, 'pro')}
              color="#4CAF50"
            />
            <Button
              title="Add Con"
              onPress={() => handleAddArgument(selectedParentId!, newArgumentTitle, 'con')}
              color="#F44336"
            />
            <Button
              title="Cancel"
              onPress={() => setSelectedParentId(null)}
              color="#9E9E9E"
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default DebateScreen;
