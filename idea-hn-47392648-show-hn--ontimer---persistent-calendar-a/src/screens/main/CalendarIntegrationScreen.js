import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { getGoogleCalendarList } from '../services/calendar/googleCalendar';
import { handleGoogleAuth } from '../services/auth/googleAuth';

const CalendarIntegrationScreen = () => {
  const { connectedCalendars, addConnectedCalendar, removeConnectedCalendar } = useCalendar();
  const [calendarList, setCalendarList] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await handleGoogleAuth();
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error authenticating:', error);
      }
    };

    checkAuth();
  }, []);

  const handleConnectCalendar = async (calendar) => {
    try {
      await addConnectedCalendar(calendar);
    } catch (error) {
      console.error('Error connecting calendar:', error);
    }
  };

  const handleDisconnectCalendar = async (calendarId) => {
    try {
      await removeConnectedCalendar(calendarId);
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
    }
  };

  const fetchCalendarList = async () => {
    try {
      const list = await getGoogleCalendarList();
      setCalendarList(list);
    } catch (error) {
      console.error('Error fetching calendar list:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCalendarList();
    }
  }, [isAuthenticated]);

  return (
    <View>
      <Text>Connected Calendars:</Text>
      <FlatList
        data={connectedCalendars}
        renderItem={({ item }) => (
          <View>
            <Text>{item.summary}</Text>
            <Button title="Disconnect" onPress={() => handleDisconnectCalendar(item.id)} />
          </View>
        )}
        keyExtractor={item => item.id}
      />
      <Text>Available Calendars:</Text>
      <FlatList
        data={calendarList}
        renderItem={({ item }) => (
          <View>
            <Text>{item.summary}</Text>
            <Button title="Connect" onPress={() => handleConnectCalendar(item)} />
          </View>
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default CalendarIntegrationScreen;
