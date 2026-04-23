import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { NightShiftSchedule } from '@/types';
import { SecureStore } from 'expo-secure-store';

const NightShiftScheduler = () => {
  const [schedule, setSchedule] = useState<NightShiftSchedule>({
    enabled: false,
    startHour: 2,
    endHour: 6,
    requiresCharging: true,
    minBatteryLevel: 20,
  });

  const saveSchedule = async (newSchedule: NightShiftSchedule) => {
    await SecureStore.setItemAsync('nightShiftSchedule', JSON.stringify(newSchedule));
    setSchedule(newSchedule);
  };

  const toggleEnabled = () => {
    saveSchedule({ ...schedule, enabled: !schedule.enabled });
  };

  const updateStartHour = (newStartHour: number) => {
    saveSchedule({ ...schedule, startHour: newStartHour });
  };

  const updateEndHour = (newEndHour: number) => {
    saveSchedule({ ...schedule, endHour: newEndHour });
  };

  const toggleRequiresCharging = () => {
    saveSchedule({ ...schedule, requiresCharging: !schedule.requiresCharging });
  };

  const updateMinBatteryLevel = (newMinBatteryLevel: number) => {
    saveSchedule({ ...schedule, minBatteryLevel: newMinBatteryLevel });
  };

  useEffect(() => {
    const loadSchedule = async () => {
      const storedSchedule = await SecureStore.getItemAsync('nightShiftSchedule');
      if (storedSchedule) {
        setSchedule(JSON.parse(storedSchedule));
      }
    };
    loadSchedule();
  }, []);

  return (
    <View>
      <Text>Night Shift Scheduler</Text>
      <Switch
        value={schedule.enabled}
        onValueChange={toggleEnabled}
      />
      <Text>Start Hour: {schedule.startHour}</Text>
      <TouchableOpacity onPress={() => updateStartHour(3)}>
        <Text>Update Start Hour</Text>
      </TouchableOpacity>
      <Text>End Hour: {schedule.endHour}</Text>
      <TouchableOpacity onPress={() => updateEndHour(7)}>
        <Text>Update End Hour</Text>
      </TouchableOpacity>
      <Text>Requires Charging: {schedule.requiresCharging ? 'Yes' : 'No'}</Text>
      <TouchableOpacity onPress={toggleRequiresCharging}>
        <Text>Toggle Requires Charging</Text>
      </TouchableOpacity>
      <Text>Min Battery Level: {schedule.minBatteryLevel}%</Text>
      <TouchableOpacity onPress={() => updateMinBatteryLevel(30)}>
        <Text>Update Min Battery Level</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NightShiftScheduler;
