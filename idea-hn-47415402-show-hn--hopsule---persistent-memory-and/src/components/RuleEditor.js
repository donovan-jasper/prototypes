import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { validateRule } from '../hooks/useAIRuleInjection';

const RuleEditor = ({ onSave }) => {
  const [ruleName, setRuleName] = useState('');
  const [rulePattern, setRulePattern] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!ruleName || !rulePattern) {
      setError('Both rule name and pattern are required');
      return;
    }

    const rule = { name: ruleName, pattern: rulePattern };
    const testCode = 'console.log("test")';
    if (!validateRule(testCode, rule)) {
      setError('Rule pattern does not match test code');
      return;
    }

    onSave(rule);
    setRuleName('');
    setRulePattern('');
    setError('');
  };

  return (
    <View>
      <TextInput
        placeholder="Rule Name"
        value={ruleName}
        onChangeText={setRuleName}
      />
      <TextInput
        placeholder="Rule Pattern (regex)"
        value={rulePattern}
        onChangeText={setRulePattern}
      />
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      <Button title="Save Rule" onPress={handleSave} />
    </View>
  );
};

export default RuleEditor;
