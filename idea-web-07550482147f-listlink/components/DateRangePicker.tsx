import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Menu, Divider } from 'react-native-paper';
import { formatDate } from '../lib/utils/formatting';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (start: Date, end: Date) => void;
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const setDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    onChange(start, end);
    closeMenu();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Date Range:</Text>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Button mode="outlined" onPress={openMenu} style={styles.button}>
            {formatDate(startDate)} - {formatDate(endDate)}
          </Button>
        }
      >
        <Menu.Item onPress={() => setDateRange(7)} title="Last 7 days" />
        <Menu.Item onPress={() => setDateRange(30)} title="Last 30 days" />
        <Menu.Item onPress={() => setDateRange(90)} title="Last 90 days" />
        <Divider />
        <Menu.Item onPress={() => setDateRange(365)} title="Last year" />
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginRight: 8,
    fontSize: 16,
  },
  button: {
    minWidth: 180,
  },
});
