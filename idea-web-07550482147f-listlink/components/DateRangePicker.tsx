import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Dialog, Portal, useTheme } from 'react-native-paper';
import { formatDate } from '../lib/utils/formatting';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (range: { start: Date; end: Date }) => void;
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const handleApply = () => {
    onChange({ start: tempStart, end: tempEnd });
    hideDialog();
  };

  const handlePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setTempStart(start);
    setTempEnd(end);
  };

  return (
    <>
      <TouchableOpacity onPress={showDialog} style={styles.pickerButton}>
        <Text style={styles.pickerText}>
          {formatDate(startDate)} - {formatDate(endDate)}
        </Text>
      </TouchableOpacity>

      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>Select Date Range</Dialog.Title>
          <Dialog.Content>
            <View style={styles.presetButtons}>
              <Button mode="outlined" onPress={() => handlePreset(7)}>Last 7 days</Button>
              <Button mode="outlined" onPress={() => handlePreset(30)}>Last 30 days</Button>
              <Button mode="outlined" onPress={() => handlePreset(90)}>Last 90 days</Button>
            </View>
            <View style={styles.dateRange}>
              <Text style={styles.dateLabel}>From: {formatDate(tempStart)}</Text>
              <Text style={styles.dateLabel}>To: {formatDate(tempEnd)}</Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
            <Button onPress={handleApply}>Apply</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  pickerButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  pickerText: {
    fontSize: 14,
  },
  presetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateRange: {
    marginTop: 16,
  },
  dateLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
});
