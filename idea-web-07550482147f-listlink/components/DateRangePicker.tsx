import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Modal, Portal, Button, RadioButton } from 'react-native-paper';

interface DateRangePickerProps {
  dateRange: { start: Date; end: Date };
  onChange: (range: { start: Date; end: Date }) => void;
}

export function DateRangePicker({ dateRange, onChange }: DateRangePickerProps) {
  const [visible, setVisible] = useState(false);
  const [selectedRange, setSelectedRange] = useState('custom');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleRangeSelect = (range: string) => {
    setSelectedRange(range);
    const now = new Date();

    switch (range) {
      case 'week':
        onChange({
          start: new Date(now.setDate(now.getDate() - 7)),
          end: new Date()
        });
        break;
      case 'month':
        onChange({
          start: new Date(now.setMonth(now.getMonth() - 1)),
          end: new Date()
        });
        break;
      case 'year':
        onChange({
          start: new Date(now.setFullYear(now.getFullYear() - 1)),
          end: new Date()
        });
        break;
      default:
        // Custom range will be handled separately
        break;
    }

    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.pickerText}>
          {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
        </Text>
      </TouchableOpacity>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Select Date Range</Text>

          <RadioButton.Group
            onValueChange={handleRangeSelect}
            value={selectedRange}
          >
            <View style={styles.radioOption}>
              <RadioButton value="week" />
              <Text>Last 7 Days</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="month" />
              <Text>Last 30 Days</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="year" />
              <Text>Last Year</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="custom" />
              <Text>Custom Range</Text>
            </View>
          </RadioButton.Group>

          <View style={styles.modalActions}>
            <Button onPress={() => setVisible(false)}>Cancel</Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  pickerButton: {
    padding: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  pickerText: {
    fontSize: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
});
