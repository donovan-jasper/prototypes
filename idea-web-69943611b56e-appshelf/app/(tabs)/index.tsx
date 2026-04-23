import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, Platform } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { AppIcon } from '../../components/AppIcon';
import { FAB, Portal, Modal, Title, Divider, Button } from 'react-native-paper';
import { ModeCard } from '../../components/ModeCard';
import { useModes } from '../../hooks/useModes';
import { useApps } from '../../hooks/useApps';
import * as Linking from 'expo-linking';
import { FocusTimer } from '../../components/FocusTimer';

export default function HomeScreen() {
  const { activeMode, setActiveMode, modes, isPremium } = useAppStore();
  const { loadModes } = useModes();
  const { loadApps, apps } = useApps();
  const [visible, setVisible] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

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
      onPress={() => {
        if (Platform.OS === 'android') {
          Linking.openURL(`intent:#Intent;package=${item.packageName};end`);
        } else {
          Linking.openURL(item.packageName);
        }
      }}
    />
  );

  const filteredApps = activeMode
    ? apps.filter(app => activeMode.appIds.includes(app.packageName))
    : apps;

  const handleAppLongPress = (app) => {
    // Handle long press (e.g., show app info or remove from mode)
    console.log('Long press on app:', app.label);
  };

  return (
    <View style={styles.container}>
      {activeMode ? (
        <>
          <View style={styles.header}>
            <Title style={styles.modeTitle}>{activeMode.name}</Title>
            {Platform.OS === 'ios' && (
              <Button
                mode="text"
                onPress={() => setShowTimer(!showTimer)}
                style={styles.timerButton}
              >
                {showTimer ? 'Hide Timer' : 'Show Timer'}
              </Button>
            )}
          </View>

          {showTimer && <FocusTimer />}

          <FlatList
            data={filteredApps}
            renderItem={renderAppItem}
            keyExtractor={(item) => item.packageName}
            numColumns={4}
            contentContainerStyle={styles.grid}
            ListEmptyComponent={
              <View style={styles.emptyApps}>
                <Text style={styles.emptyText}>No apps in this mode</Text>
                <Button
                  mode="contained"
                  onPress={showModal}
                  style={styles.addAppsButton}
                >
                  Add Apps
                </Button>
              </View>
            }
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
          {modes.length > 0 ? (
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
          ) : (
            <View style={styles.noModes}>
              <Text style={styles.noModesText}>No modes created yet</Text>
              <Button
                mode="contained"
                onPress={() => {
                  hideModal();
                  // Navigate to mode creation screen
                }}
              >
                Create First Mode
              </Button>
            </View>
          )}
        </Modal>
      </Portal>

      <FAB
        style={styles.fab}
        icon="swap-horizontal"
        onPress={showModal}
        label="Modes"
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  timerButton: {
    marginLeft: 'auto',
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
    color: '#666',
  },
  button: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    elevation: 2,
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  emptyApps: {
    alignItems: 'center',
    marginTop: 40,
  },
  addAppsButton: {
    marginTop: 16,
  },
  noModes: {
    alignItems: 'center',
    padding: 20,
  },
  noModesText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
});
