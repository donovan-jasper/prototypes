import { useState } from 'react';
import { addTimelineEvent, getTimelineEvents } from '../lib/timeline';

export const useTimeline = () => {
  const [events, setEvents] = useState([]);

  const loadTimeline = async (startDate = null, endDate = null) => {
    const loadedEvents = await getTimelineEvents(startDate, endDate);
    setEvents(loadedEvents);
  };

  const addEvent = async (event) => {
    const newEvent = await addTimelineEvent(event);
    setEvents([newEvent, ...events]);
  };

  return {
    events,
    loadTimeline,
    addEvent,
  };
};
