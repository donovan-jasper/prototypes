import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { getConnectedCalendars } from '../services/data/settingsRepository';

const SettingsScreen = () => {
  const { connectedCalendars } = useCalendar();
  const [calendarList, setCalendarList] = useState([]);

  useEffect(() => {
    const fetchCalendarList = async () => {
      try {
        const list = await getConnectedCalendars();
        setCalendarList(list);
      } catch (error) {
        console.error('Error fetching calendar list:', error);
      }
    };

    fetchCalendarList();
  }, []);

  return (
    <View>
      <Text>Connected Calendars:</Text>
      <FlatList
        data={calendarList}
        renderItem={({ item }) => (
          <View>
            <Text>{item.summary}</Text>
          </View>
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default SettingsScreen;
