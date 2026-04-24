import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { COMMON_APPS } from '../../lib/app-blocker';
import { useStore } from '../../store/useStore';

export default function HomeScreen() {
  const router = useRouter();
  const { activeSession } = useStore();

  const [selectedDuration, setSelectedDuration] = useState(25);
  const [showAppSelector, setShowAppSelector] = useState(false);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [isStrictMode, setIsStrictMode] = useState(false);

  const durations = [25, 50, 90];

  const handleStartSession = () => {
    if (activeSession) {
      router.push('/focus-session');
      return;
    }

    router.push({
      pathname: '/focus-session',
      params: {
        duration: selectedDuration.toString(),
        blockedApps: selectedApps.join(','),
        mode: isStrictMode ? 'strict' : 'gentle',
      },
    });
  };

  const toggleAppSelection = (appId: string) => {
    setSelectedApps(prev =>
      prev.includes(appId)
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const renderDurationButtons = () => {
    return durations.map(duration => (
      <TouchableOpacity
        key={duration}
        style={[
          styles.durationButton,
          selectedDuration === duration && styles.selectedDurationButton
        ]}
        onPress={() => setSelectedDuration(duration)}
      >
        <Text style={[
          styles.durationText,
          selectedDuration === duration && styles.selectedDurationText
        ]}>
          {duration} min
        </Text>
      </TouchableOpacity>
    ));
  };

  const renderAppSelector = () => {
    return (
      <Modal
        visible={showAppSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAppSelector(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Apps to Block</Text>

            <ScrollView style={styles.appList}>
              {COMMON_APPS.map(app => (
                <TouchableOpacity
                  key={app.id}
                  style={styles.appItem}
                  onPress={() => toggleAppSelection(app.id)}
                >
                  <Text style={styles.appName}>{app.name}</Text>
                  <View style={[
                    styles.checkbox,
                    selectedApps.includes(app.id) && styles.checkedCheckbox
                  ]} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAppSelector(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => setShowAppSelector(false)}
              >
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start Focus Session</Text>

      <View style={styles.durationContainer}>
        {renderDurationButtons()}
      </View>

      <TouchableOpacity
        style={styles.appSelectorButton}
        onPress={() => setShowAppSelector(true)}
      >
        <Text style={styles.appSelectorText}>
          {selectedApps.length > 0
            ? `${selectedApps.length} apps selected`
            : 'Select apps to block'}
        </Text>
      </TouchableOpacity>

      <View style={styles.modeContainer}>
        <Text style={styles.modeLabel}>Strict Mode</Text>
        <Switch
          value={isStrictMode}
          onValueChange={setIsStrictMode}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isStrictMode ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStartSession}
      >
        <Text style={styles.startButtonText}>
          {activeSession ? 'Resume Session' : 'Start Focus'}
        </Text>
      </TouchableOpacity>

      {renderAppSelector()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  durationButton: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  selectedDurationButton: {
    backgroundColor: '#1cc910',
  },
  durationText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDurationText: {
    color: 'white',
    fontWeight: 'bold',
  },
  appSelectorButton: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 20,
  },
  appSelectorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modeLabel: {
    fontSize: 16,
  },
  startButton: {
    backgroundColor: '#1cc910',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  appList: {
    maxHeight: 300,
    marginBottom: 15,
  },
  appItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  appName: {
    fontSize: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  checkedCheckbox: {
    backgroundColor: '#1cc910',
    borderColor: '#1cc910',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#1cc910',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
