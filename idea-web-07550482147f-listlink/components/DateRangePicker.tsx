import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Menu, Divider, useTheme } from 'react-native-paper';
import { formatDate } from '../lib/utils/formatting';

interface DateRangePickerProps {
  initialRange: { start: Date; end: Date };
  onRangeSelected: (range: { start: Date; end: Date }) => void;
}

export function DateRangePicker({ initialRange, onRangeSelected }: DateRangePickerProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [range, setRange] = useState(initialRange);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const selectRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    const newRange = { start, end };
    setRange(newRange);
    onRangeSelected(newRange);
    closeMenu();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Date Range:</Text>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Button
            mode="outlined"
            onPress={openMenu}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {formatDate(range.start)} - {formatDate(range.end)}
          </Button>
        }
      >
        <Menu.Item
          onPress={() => selectRange(7)}
          title="Last 7 days"
        />
        <Menu.Item
          onPress={() => selectRange(30)}
          title="Last 30 days"
        />
        <Menu.Item
          onPress={() => selectRange(90)}
          title="Last 90 days"
        />
        <Menu.Item
          onPress={() => selectRange(365)}
          title="Last year"
        />
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    marginRight: 8,
  },
  button: {
    borderColor: '#ccc',
  },
  buttonContent: {
    height: 36,
  },
});
