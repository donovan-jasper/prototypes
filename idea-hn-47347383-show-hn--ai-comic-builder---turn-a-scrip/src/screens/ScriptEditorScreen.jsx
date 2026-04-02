import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ScriptEditorScreen = () => {
  const [script, setScript] = useState('');
  const navigation = useNavigation();

  const handleScriptChange = (text) => {
    setScript(text);
  };

  const handlePreviewPress = () => {
    navigation.navigate('VideoPreview', { script });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Script Editor</Text>
      <TextInput
        style={styles.scriptInput}
        placeholder="Enter your story..."
        value={script}
        onChangeText={handleScriptChange}
        multiline={true}
        numberOfLines={10}
      />
      <TouchableOpacity style={styles.previewButton} onPress={handlePreviewPress}>
        <Text style={styles.previewButtonText}>Preview Video</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scriptInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    fontSize: 16,
  },
  previewButton: {
    backgroundColor: '#00BFFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  previewButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default ScriptEditorScreen;
