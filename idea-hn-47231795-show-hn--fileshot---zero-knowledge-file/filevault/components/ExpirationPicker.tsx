import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, RadioButton } from 'react-native-paper';
import { Colors } from '@/constants/Colors';

const ExpirationPicker = ({ value, onChange }) => {
  const options = [
    { label: '1 hour', value: 1 },
    { label: '6 hours', value: 6 },
    { label: '24 hours', value: 24 },
    { label: '7 days', value: 168 },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expiration Time</Text>
      <RadioButton.Group onValueChange={onChange} value={value}>
        {options.map((option) => (
          <View key={option.value} style={styles.option}>
            <RadioButton value={option.value} />
            <Text style={styles.label}>{option.label}</Text>
          </View>
        ))}
      </RadioButton.Group>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.light.text,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  label: {
    marginLeft: 8,
    color: Colors.light.text,
  },
});

export default ExpirationPicker;
