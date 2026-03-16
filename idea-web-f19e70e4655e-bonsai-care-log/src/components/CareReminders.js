import React, { useState, useEffect } from 'react';

function CareReminders() {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    // Fetch care reminders from the server
    fetch('/api/care-reminders')
      .then(response => response.json())
      .then(data => setReminders(data));
  }, []);

  return (
    <div>
      <h1>Care Reminders</h1>
      <ul>
        {reminders.map(reminder => (
          <li key={reminder.id}>
            <h2>{reminder.plantName}</h2>
            <p>{reminder.message}</p>
            <p>Due: {new Date(reminder.dueDate).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CareReminders;
