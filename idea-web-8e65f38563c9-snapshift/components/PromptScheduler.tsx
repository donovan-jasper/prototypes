import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useVoicePrompts } from '../hooks/useVoicePrompts';

export default function PromptScheduler() {
  const { scheduledPrompts, updatePromptSchedule } = useVoicePrompts();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime && selectedPromptId) {
      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();
      updatePromptSchedule(selectedPromptId, { time: { hour: hours, minute: minutes } });
    }
  };

  const handleTogglePrompt = (promptId: string, enabled: boolean) => {
    updatePromptSchedule(promptId, { enabled });
  };

  return (
    <View style={styles.container}>
      {scheduledPrompts.map((prompt) => (
        <View key={prompt.id} style={styles.promptContainer}>
          <Text style={styles.promptTitle}>{prompt.title}</Text>
          <View style={styles.promptControls}>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => {
                setSelectedPromptId(prompt.id);
                setShowTimePicker(true);
              }}
            >
              <Text style={styles.timeButtonText}>
                {`${prompt.time.hour.toString().padStart(2, '0')}:${prompt.time.minute.toString().padStart(2, '0')}`}
              </Text>
            </TouchableOpacity>
            <Switch
              value={prompt.enabled}
              onValueChange={(value) => handleTogglePrompt(prompt.id, value)}
            />
          </View>
        </View>
      ))}
      {showTimePicker && (
        <DateTimePicker
          value={new Date(0, 0, 0, scheduledPrompts.find((p) => p.id === selectedPromptId)?.time.hour || 0, scheduledPrompts.find((p) => p.id === selectedPromptId)?.time.minute || 0)}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  promptContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  promptTitle: {
    fontSize: 16,
  },
  promptControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeButton: {
    padding: 8,
    backgroundColor: '#673ab7',
    borderRadius: 4,
    marginRight: 8,
  },
  timeButtonText: {
    color: '#fff',
  },
});
