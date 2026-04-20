import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Alert } from '@/types/alerts';

interface AlertConfigProps {
  alert?: Alert;
  onSave: (alert: Alert) => void;
  onCancel: () => void;
}

const AlertConfig: React.FC<AlertConfigProps> = ({ alert, onSave, onCancel }) => {
  const [type, setType] = useState(alert?.type || 'threshold');
  const [value, setValue] = useState(alert?.value?.toString() || '');
  const [condition, setCondition] = useState(alert?.condition || 'above');
  const [hysteresis, setHysteresis] = useState(alert?.hysteresis?.toString() || '');
  const [enabled, setEnabled] = useState(alert?.enabled ?? true);

  const handleSave = () => {
    const newAlert: Alert = {
      id: alert?.id || Date.now().toString(),
      sensorId: alert?.sensorId || '',
      type,
      value: parseFloat(value),
      condition,
      hysteresis: hysteresis ? parseFloat(hysteresis) : undefined,
      enabled,
    };
    onSave(newAlert);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{alert ? 'Edit Alert' : 'Create Alert'}</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Alert Type</Text>
        <Picker
          selectedValue={type}
          onValueChange={(itemValue) => setType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Threshold" value="threshold" />
          <Picker.Item label="Disconnection" value="disconnection" />
          <Picker.Item label="Battery Low" value="batteryLow" />
        </Picker>
      </View>

      {type === 'threshold' && (
        <>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Value</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
              placeholder="Enter threshold value"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Condition</Text>
            <Picker
              selectedValue={condition}
              onValueChange={(itemValue) => setCondition(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Above" value="above" />
              <Picker.Item label="Below" value="below" />
            </Picker>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Hysteresis (optional)</Text>
            <TextInput
              style={styles.input}
              value={hysteresis}
              onChangeText={setHysteresis}
              keyboardType="numeric"
              placeholder="Enter hysteresis value"
            />
          </View>
        </>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Enabled</Text>
        <Switch
          value={enabled}
          onValueChange={setEnabled}
        />
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AlertConfig;
