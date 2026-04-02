import { useState, useEffect } from 'react';
import { getConnectedCalendars } from '../services/data/settingsRepository';
import { syncGoogleCalendar } from '../services/calendar/googleCalendar';

const useCalendarSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    const syncCalendars = async () => {
      try {
        setIsSyncing(true);
        const calendars = await getConnectedCalendars();
        for (const calendar of calendars) {
          await syncGoogleCalendar(calendar.id);
        }
        setLastSync(new Date());
      } catch (error) {
        console.error('Error syncing calendars:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    const intervalId = setInterval(syncCalendars, 15 * 60 * 1000); // 15 minutes
    return () => clearInterval(intervalId);
  }, []);

  return { isSyncing, lastSync };
};

export default useCalendarSync;
