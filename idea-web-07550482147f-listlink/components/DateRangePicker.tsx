import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DateRangePickerProps {
  dateRange: { start: Date; end: Date };
  onChange: (range: { start: Date; end: Date }) => void;
}

export function DateRangePicker({ dateRange, onChange }: DateRangePickerProps) {
  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);
  const [tempRange, setTempRange] = useState(dateRange);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      if (showPicker === 'start') {
        setTempRange({ ...tempRange, start: selectedDate });
      } else if (showPicker === 'end') {
        setTempRange({ ...tempRange, end: selectedDate });
      }
    }
    setShowPicker(null);
  };

  const applyDateRange = () => {
    onChange(tempRange);
  };

  const setPresetRange = (preset: 'week' | 'month' | 'year') => {
    const now = new Date();
    let startDate = new Date();

    switch (preset) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const newRange = { start: startDate, end: now };
    setTempRange(newRange);
    onChange(newRange);
  };

  return (
    <Card style={styles.container} mode="outlined">
      <View style={styles.presetButtons}>
        <Button
          mode="outlined"
          onPress={() => setPresetRange('week')}
          style={styles.presetButton}
        >
          Week
        </Button>
        <Button
          mode="outlined"
          onPress={() => setPresetRange('month')}
          style={styles.presetButton}
        >
          Month
        </Button>
        <Button
          mode="outlined"
          onPress={() => setPresetRange('year')}
          style={styles.presetButton}
        >
          Year
        </Button>
      </View>

      <View style={styles.dateRow}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowPicker('start')}
        >
          <Text style={styles.dateText}>
            From: {tempRange.start.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowPicker('end')}
        >
          <Text style={styles.dateText}>
            To: {tempRange.end.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={showPicker === 'start' ? tempRange.start : tempRange.end}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Button
        mode="contained"
        onPress={applyDateRange}
        style={styles.applyButton}
      >
        Apply
      </Button>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  presetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  presetButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
  },
  applyButton: {
    marginTop: 8,
  },
});
