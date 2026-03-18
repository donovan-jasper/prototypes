const mongoose = require('mongoose');

const careReminderSchema = new mongoose.Schema({
  plantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    required: true
  },
  plantName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CareReminder', careReminderSchema);
