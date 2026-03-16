import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Button, FlatList, TouchableOpacity, Text } from 'react-native';
import { useModes } from '../hooks/useModes';
import { useApps } from '../hooks/useApps';

const ModeEditorModal = ({ navigation }) => {
  const [name, setName] = useState('');
  const [selectedApps, setSelectedApps] = useState([]);
  const { addMode } = useModes();
  const { apps } = useApps();

  const handleSave = () => {
    const newMode = {
      id: Date.now().toString(),
      name,
      appIds: selectedApps.map(app => app.packageName),
      color: '#6200EE', // Default color
    };
    addMode(newMode);
    navigation.goBack();
  };

  const toggleAppSelection = (app) => {
    if (selectedApps.includes(app)) {
      setSelectedApps(selectedApps.filter(a => a !== app));
    } else {
      setSelectedApps([...selectedApps, app]);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Mode name"
        value={name}
        onChangeText={setName}
      />
      <FlatList
        data={apps}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.appItem,
              selectedApps.includes(item) && styles.selectedAppItem,
            ]}
            onPress={() => toggleAppSelection(item)}
          >
            <Text>{item.label}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.packageName}
      />
      <Button title="Save" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  appItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  selectedAppItem: {
    backgroundColor: '#e0e0e0',
  },
});

export default ModeEditorModal;
