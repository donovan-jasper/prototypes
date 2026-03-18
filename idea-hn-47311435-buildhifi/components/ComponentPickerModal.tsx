import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Modal, Portal, Searchbar, Card, Title, Paragraph, Button, IconButton } from 'react-native-paper';
import { getComponents } from '@/lib/db/queries';
import { Component } from '@/lib/types';
import useBuildStore from '@/lib/store/buildStore';

interface ComponentPickerModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const ComponentPickerModal: React.FC<ComponentPickerModalProps> = ({ visible, onDismiss }) => {
  const [components, setComponents] = useState<Component[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const addComponent = useBuildStore((state) => state.addComponent);

  useEffect(() => {
    if (visible) {
      loadComponents();
    }
  }, [visible, searchQuery]);

  const loadComponents = async () => {
    try {
      const result = await getComponents(searchQuery);
      const parsedComponents = result.map((item: any) => ({
        ...item,
        specs: typeof item.specs_json === 'string' ? JSON.parse(item.specs_json) : item.specs_json,
      }));
      setComponents(parsedComponents);
    } catch (error) {
      console.error('Error loading components:', error);
    }
  };

  const handleAddComponent = (component: Component) => {
    addComponent(component);
    onDismiss();
  };

  const renderItem = ({ item }: { item: Component }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>{item.brand}</Paragraph>
        <Paragraph>${item.price}</Paragraph>
        <View style={styles.specs}>
          {item.specs.impedance && (
            <Paragraph style={styles.spec}>Impedance: {item.specs.impedance}Ω</Paragraph>
          )}
          {item.specs.powerWatts && (
            <Paragraph style={styles.spec}>Power: {item.specs.powerWatts}W</Paragraph>
          )}
          {item.specs.maxPowerWatts && (
            <Paragraph style={styles.spec}>Max Power: {item.specs.maxPowerWatts}W</Paragraph>
          )}
        </View>
      </Card.Content>
      <Card.Actions>
        <Button mode="contained" onPress={() => handleAddComponent(item)}>
          Add
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.header}>
          <Title style={styles.title}>Add Component</Title>
          <IconButton icon="close" onPress={onDismiss} />
        </View>
        <Searchbar
          placeholder="Search components..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <FlatList
          data={components}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
        />
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 20,
  },
  searchbar: {
    margin: 16,
  },
  list: {
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 16,
  },
  specs: {
    marginTop: 8,
  },
  spec: {
    fontSize: 12,
    color: '#666',
  },
});

export default ComponentPickerModal;
