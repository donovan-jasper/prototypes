export const filterEventsByDistance = (events, maxDistance) => {
  return events.filter(event => event.distance <= maxDistance);
};
