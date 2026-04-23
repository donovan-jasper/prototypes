import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { AppIcon } from '../../components/AppIcon';
import { FAB, Portal, Modal, Title, Divider } from 'react-native-paper';
import { ModeCard } from '../../components/ModeCard';
import { useModes } from '../../hooks/useModes';
import { useApps } from '../../hooks/useApps';
import { Linking } from 'react-native';

export default function HomeScreen() {
  const { activeMode, setActiveMode, modes } = useAppStore();
  const { loadModes } = useModes();
  const { loadApps, apps } = useApps();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    loadModes();
    loadApps();
  }, []);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const handleModeSelect = (mode) => {
    setActiveMode(mode);
    hideModal();
  };

  const renderAppItem = ({ item }) => (
    <AppIcon
      app={item}
      onPress={() => Linking.openURL(`intent:#Intent;package=${item.packageName};end`)}
    />
  );

  const filteredApps = activeMode
    ? apps.filter(app => activeMode.appIds.includes(app.packageName))
    : apps;

  return (
    <View style={styles.container}>
      {activeMode ? (
        <>
          <View style={styles.header}>
            <Title style={styles.modeTitle}>{activeMode.name}</Title>
          </View>
          <FlatList
            data={filteredApps}
            renderItem={renderAppItem}
            keyExtractor={(item) => item.packageName}
            numColumns={4}
            contentContainerStyle={styles.grid}
          />
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No active mode selected</Text>
          <TouchableOpacity style={styles.button} onPress={showModal}>
            <Text style={styles.buttonText}>Select Mode</Text>
          </TouchableOpacity>
        </View>
      )}

      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modal}>
          <Title style={styles.modalTitle}>Select Mode</Title>
          <Divider />
          <FlatList
            data={modes}
            renderItem={({ item }) => (
              <ModeCard
                mode={item}
                onPress={() => handleModeSelect(item)}
                isActive={activeMode?.id === item.id}
              />
            )}
            keyExtractor={(item) => item.id}
          />
        </Modal>
      </Portal>

      <FAB
        style={styles.fab}
        icon="swap-horizontal"
        onPress={showModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  grid: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});
