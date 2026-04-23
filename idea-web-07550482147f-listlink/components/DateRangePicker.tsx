import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Dialog, Portal, RadioButton } from 'react-native-paper';
import { formatDate } from '../lib/utils/formatting';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (start: Date, end: Date) => void;
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [visible, setVisible] = useState(false);
  const [selectedRange, setSelectedRange] = useState('30days');

  const ranges = [
    { label: 'Last 7 days', value: '7days' },
    { label: 'Last 30 days', value: '30days' },
    { label: 'Last 90 days', value: '90days' },
    { label: 'This month', value: 'thisMonth' },
    { label: 'Last month', value: 'lastMonth' },
    { label: 'This year', value: 'thisYear' },
  ];

  const applyRange = (range: string) => {
    const now = new Date();
    let start: Date;

    switch (range) {
      case '7days':
        start = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30days':
        start = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90days':
        start = new Date(now.setDate(now.getDate() - 90));
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = new Date(now.setDate(now.getDate() - 30));
    }

    if (!end) {
      end = new Date();
    }

    onChange(start, end);
    setSelectedRange(range);
    setVisible(false);
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setVisible(true)} style={styles.button}>
        <Text style={styles.buttonText}>
          {formatDate(startDate)} - {formatDate(endDate)}
        </Text>
      </TouchableOpacity>

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Select Date Range</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              value={selectedRange}
              onValueChange={value => setSelectedRange(value)}
            >
              {ranges.map(range => (
                <RadioButton.Item
                  key={range.value}
                  label={range.label}
                  value={range.value}
                />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Cancel</Button>
            <Button onPress={() => applyRange(selectedRange)}>Apply</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    minWidth: 150,
  },
  buttonText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
