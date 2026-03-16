import React, { useContext, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button, List } from 'react-native-paper';
import AlertSetup from '../components/AlertSetup';
import { AppContext } from '../context/AppContext';

const SettingsScreen: React.FC = () => {
  const { alerts, addAlert, removeAlert } = useContext(AppContext);
  const [showAlertSetup, setShowAlertSetup] = useState(false);

  const handleSaveAlert = (alert: { program: string; time: string; weather: boolean; breakingNews: boolean }) => {
    addAlert(alert);
    setShowAlertSetup(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alerts</Text>
      {showAlertSetup ? (
        <AlertSetup onSave={handleSaveAlert} />
      ) : (
        <>
          <FlatList
            data={alerts}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <List.Item
                title={item.program}
                description={`Time: ${item.time}`}
                right={() => (
                  <Button onPress={() => removeAlert(index)}>Delete</Button>
                )}
              />
            )}
          />
          <Button
            mode="contained"
            onPress={() => setShowAlertSetup(true)}
            style={styles.addButton}
          >
            Add Alert
          </Button>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  addButton: {
    marginTop: 16,
  },
});

export default SettingsScreen;
