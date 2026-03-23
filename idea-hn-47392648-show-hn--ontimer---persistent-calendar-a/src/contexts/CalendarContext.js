import React, { createContext, useContext, useState, useEffect } from 'react';
import { getConnectedCalendars, saveConnectedCalendar } from '../services/data/settingsRepository';

const CalendarContext = createContext();

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

export const CalendarProvider = ({ children }) => {
  const [connectedCalendars, setConnectedCalendars] = useState([]);

  useEffect(() => {
    loadConnectedCalendars();
  }, []);

  const loadConnectedCalendars = async () => {
    try {
      const calendars = await getConnectedCalendars();
      setConnectedCalendars(calendars);
    } catch (error) {
      console.error('Error loading connected calendars:', error);
    }
  };

  const addConnectedCalendar = async (calendar) => {
    try {
      await saveConnectedCalendar(calendar);
      setConnectedCalendars(prev => [...prev, calendar]);
    } catch (error) {
      console.error('Error adding connected calendar:', error);
    }
  };

  const removeConnectedCalendar = async (calendarId) => {
    try {
      // Remove from local storage
      // In a real implementation, we would call a function to remove from DB
      setConnectedCalendars(prev => prev.filter(cal => cal.id !== calendarId));
    } catch (error) {
      console.error('Error removing connected calendar:', error);
    }
  };

  const value = {
    connectedCalendars,
    addConnectedCalendar,
    removeConnectedCalendar,
  };

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
};
