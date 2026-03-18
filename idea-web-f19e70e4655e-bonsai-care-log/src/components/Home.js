import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Verdant — Universal Plant Care Companion</h1>
      <p>Track every plant's journey from seedling to thriving greenery with photo timelines, smart care reminders, and a community that grows with you.</p>
      <nav>
        <ul>
          <li><Link to="/my-plants">My Plants</Link></li>
          <li><Link to="/care-reminders">Care Reminders</Link></li>
          <li><Link to="/community">Community</Link></li>
        </ul>
      </nav>
    </div>
  );
}

export default Home;
