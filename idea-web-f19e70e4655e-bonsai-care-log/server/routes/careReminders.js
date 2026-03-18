const express = require('express');
const router = express.Router();
const CareReminder = require('../models/CareReminder');

router.get('/', async (req, res) => {
  try {
    const reminders = await CareReminder.find().sort({ dueDate: 1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const reminder = await CareReminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const reminder = new CareReminder({
    plantId: req.body.plantId,
    plantName: req.body.plantName,
    message: req.body.message,
    dueDate: req.body.dueDate
  });

  try {
    const newReminder = await reminder.save();
    res.status(201).json(newReminder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const reminder = await CareReminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    if (req.body.message) reminder.message = req.body.message;
    if (req.body.dueDate) reminder.dueDate = req.body.dueDate;
    if (req.body.completed !== undefined) reminder.completed = req.body.completed;

    const updatedReminder = await reminder.save();
    res.json(updatedReminder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const reminder = await CareReminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    await reminder.deleteOne();
    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
