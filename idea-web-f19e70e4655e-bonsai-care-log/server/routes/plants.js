const express = require('express');
const router = express.Router();
const Plant = require('../models/Plant');
const Photo = require('../models/Photo');

router.get('/', async (req, res) => {
  try {
    const plants = await Plant.find().sort({ createdAt: -1 });
    res.json(plants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }
    const photos = await Photo.find({ plantId: req.params.id }).sort({ date: 1 });
    res.json({ plant, photos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const plant = new Plant({
    name: req.body.name,
    species: req.body.species,
    acquiredDate: req.body.acquiredDate
  });

  try {
    const newPlant = await plant.save();
    res.status(201).json(newPlant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    if (req.body.name) plant.name = req.body.name;
    if (req.body.species) plant.species = req.body.species;
    if (req.body.acquiredDate) plant.acquiredDate = req.body.acquiredDate;

    const updatedPlant = await plant.save();
    res.json(updatedPlant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    await Photo.deleteMany({ plantId: req.params.id });
    await plant.deleteOne();
    res.json({ message: 'Plant deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/photos', async (req, res) => {
  const photo = new Photo({
    plantId: req.params.id,
    url: req.body.url,
    caption: req.body.caption,
    date: req.body.date || new Date()
  });

  try {
    const newPhoto = await photo.save();
    res.status(201).json(newPhoto);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
