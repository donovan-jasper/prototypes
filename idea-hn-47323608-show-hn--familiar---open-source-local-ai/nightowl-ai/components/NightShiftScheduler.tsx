import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface NightShiftSchedulerProps {
  schedule: {
    startHour: number;
    endHour: number;
  };
  onUpdate: (schedule: { startHour: number; endHour: number }) => void;
}

export function NightShiftScheduler({ schedule, onUpdate }: NightShiftSchedulerProps) {
  const [showStartPicker, setShowStartPicker] = React.useState(false);
  const [showEndPicker, setShowEndPicker] = React.useState(false);

  const handleStartChange = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      const hours = selectedDate.getHours();
      onUpdate({ ...schedule, startHour: hours });
    }
  };

  const handleEndChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      const hours = selectedDate.getHours();
      onUpdate({ ...schedule, endHour: hours });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Start Time:</Text>
      <Button title={`${schedule.startHour}:00`} onPress={() => setShowStartPicker(true)} />
      {showStartPicker && (
        <DateTimePicker
          value={new Date().setHours(schedule.startHour, 0, 0, 0)}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleStartChange}
        />
      )}

      <Text style={styles.label}>End Time:</Text>
      <Button title={`${schedule.endHour}:00`} onPress={() => setShowEndPicker(true)} />
      {showEndPicker && (
        <DateTimePicker
          value={new Date().setHours(schedule.endHour, 0, 0, 0)}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleEndChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    marginBottom: 5,
  },
});
