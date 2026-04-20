import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useStore } from '@/store';
import { useNavigation } from '@react-navigation/native';

const AddAlertScreen = () => {
  const [sensorId, setSensorId] = useState('');
  const [alertType, setAlertType] = useState('threshold');
  const [value, setValue] = useState('');
  const [condition, setCondition] = useState('above');
  const [hysteresis, setHysteresis] = useState('');
  const { addAlert, sensors } = useStore();
  const navigation = useNavigation();

  const handleSubmit = () => {
    if (!sensorId) {
      Alert.alert('Error', 'Please select a sensor');
      return;
    }

    if (!value && alertType !== 'disconnection') {
      Alert.alert('Error', 'Please enter a value');
      return;
    }

    const numericValue = alertType !== 'disconnection' ? parseFloat(value) : parseInt(value, 10);
    const numericHysteresis = hysteresis ? parseFloat(hysteresis) : undefined;

    if (isNaN(numericValue) && alertType !== 'disconnection') {
      Alert.alert('Error', 'Value must be a number');
      return;
    }

    if (numericHysteresis !== undefined && isNaN(numericHysteresis)) {
      Alert.alert('Error', 'Hysteresis must be a number');
      return;
    }

    const newAlert = {
      id: Date.now().toString(),
      sensorId,
      type: alertType,
      value: numericValue,
      condition: alertType === 'threshold' ? condition : undefined,
      hysteresis: numericHysteresis,
      isActive: true,
    };

    addAlert(newAlert);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Alert</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Sensor</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={sensorId}
            onValueChange={(itemValue) => setSensorId(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select a sensor" value="" />
            {sensors.map((sensor) => (
              <Picker.Item key={sensor.id} label={sensor.name} value={sensor.id} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Alert Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={alertType}
            onValueChange={(itemValue) => setAlertType(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Threshold" value="threshold" />
            <Picker.Item label="Disconnection" value="disconnection" />
            <Picker.Item label="Battery" value="battery" />
            <Picker.Item label="Pattern" value="pattern" />
          </Picker>
        </View>
      </View>

      {alertType === 'threshold' && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Condition</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={condition}
              onValueChange={(itemValue) => setCondition(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Above" value="above" />
              <Picker.Item label="Below" value="below" />
            </Picker>
          </View>
        </View>
      )}

      {alertType === 'pattern' && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Pattern</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={condition}
              onValueChange={(itemValue) => setCondition(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Rising" value="rising" />
              <Picker.Item label="Falling" value="falling" />
            </Picker>
          </View>
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          {alertType === 'threshold' ? 'Threshold Value' :
           alertType === 'disconnection' ? 'Disconnection Time (ms)' :
           alertType === 'battery' ? 'Battery Level (%)' :
           'Change Threshold'}
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={value}
          onChangeText={setValue}
          placeholder={alertType === 'disconnection' ? '30000' : 'Enter value'}
        />
      </View>

      {alertType === 'threshold' && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Hysteresis (optional)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={hysteresis}
            onChangeText={setHysteresis}
            placeholder="Enter hysteresis value"
          />
        </View>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Create Alert</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddAlertScreen;
