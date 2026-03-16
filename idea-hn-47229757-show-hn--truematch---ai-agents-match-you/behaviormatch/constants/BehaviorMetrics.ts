export default [
  // Message send metrics
  {
    type: 'message_send',
    key: 'response_time',
    description: 'Time taken to respond to a message',
    min: 0,
    max: 300, // 5 minutes
  },
  {
    type: 'message_send',
    key: 'message_length',
    description: 'Length of the message in characters',
    min: 0,
    max: 1000,
  },

  // App usage metrics
  {
    type: 'app_usage',
    key: 'session_duration',
    description: 'Duration of app usage session in seconds',
    min: 0,
    max: 3600, // 1 hour
  },
  {
    type: 'app_usage',
    key: 'time_of_day',
    description: 'Hour of the day when the app was used',
    min: 0,
    max: 23,
  },

  // Swipe action metrics
  {
    type: 'swipe_action',
    key: 'swipe_speed',
    description: 'Speed of the swipe action in pixels per second',
    min: 0,
    max: 2000,
  },
  {
    type: 'swipe_action',
    key: 'swipe_direction',
    description: 'Direction of the swipe (left or right)',
    values: ['left', 'right'],
  },

  // Add more metrics as needed
];
