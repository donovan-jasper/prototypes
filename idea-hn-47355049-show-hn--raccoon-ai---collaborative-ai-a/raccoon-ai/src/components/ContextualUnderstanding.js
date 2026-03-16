import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import NLP from 'react-native-nlp';

const ContextualUnderstanding = () => {
  const [input, setInput] = useState('');
  const [context, setContext] = useState('');

  const analyzeInput = () => {
    NLP.analyze(input).then((result) => {
      setContext(JSON.stringify(result, null, 2));
    });
  };

  return (
    <View>
      <Text>Contextual Understanding</Text>
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Type something..."
      />
      <Button title="Analyze" onPress={analyzeInput} />
      <Text>{context}</Text>
    </View>
  );
};

export default ContextualUnderstanding;
