import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { saveWidgetData, loadWidgetData } from '../utils/database';

interface ScratchpadProps {
  widgetId: string;
}

const Scratchpad: React.FC<ScratchpadProps> = ({ widgetId }) => {
  const { currentTheme } = useAppStore();
  const [text, setText] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const savedText = await loadWidgetData(widgetId);
      if (savedText) {
        setText(savedText);
      }
    };
    loadData();
  }, [widgetId]);

  const handleTextChange = async (newText: string) => {
    setText(newText);
    await saveWidgetData(widgetId, newText);
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.widgetBackground }]}>
      <Text style={[styles.title, { color: currentTheme.text }]}>Scratchpad</Text>

      <TextInput
        style={[styles.input, { color: currentTheme.text }]}
        multiline
        placeholder="Type your notes here..."
        placeholderTextColor={currentTheme.text + '80'}
        value={text}
        onChangeText={handleTextChange}
        autoCorrect={false}
        autoCapitalize="sentences"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default Scratchpad;
