const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/verdant', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const plantRoutes = require('./routes/plants');
const careReminderRoutes = require('./routes/careReminders');
const communityPostRoutes = require('./routes/communityPosts');

app.use('/api/plants', plantRoutes);
app.use('/api/care-reminders', careReminderRoutes);
app.use('/api/community-posts', communityPostRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
