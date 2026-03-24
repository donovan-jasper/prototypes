import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';

const WorkflowBuilder = () => {
  const [steps, setSteps] = useState([]);
  const [newStep, setNewStep] = useState('');

  const handleAddStep = () => {
    setSteps([...steps, newStep]);
    setNewStep('');
  };

  const handleRemoveStep = (index) => {
    setSteps(steps.filter((step, i) => i !== index));
  };

  return (
    <View>
      <FlatList
        data={steps}
        renderItem={({ item, index }) => (
          <View>
            <Text>{item}</Text>
            <TouchableOpacity onPress={() => handleRemoveStep(index)}>
              <Feather name="trash-2" size={24} color="black" />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <TouchableOpacity onPress={handleAddStep}>
        <Feather name="plus" size={24} color="black" />
      </TouchableOpacity>
      <TextInput
        value={newStep}
        onChangeText={setNewStep}
        placeholder="Add new step"
      />
    </View>
  );
};

export default WorkflowBuilder;
