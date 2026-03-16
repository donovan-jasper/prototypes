import { openDatabase, addPlant, getPlants, updatePlant, deletePlant } from '../lib/database';

describe('Database operations', () => {
  beforeEach(async () => {
    await openDatabase();
  });

  test('adds a plant successfully', async () => {
    const plant = await addPlant({
      name: 'Monstera',
      species: 'Monstera deliciosa',
      wateringFrequency: 7,
      lastWatered: new Date().toISOString(),
    });
    expect(plant.id).toBeDefined();
    expect(plant.name).toBe('Monstera');
  });

  test('retrieves all plants', async () => {
    await addPlant({ name: 'Pothos', species: 'Epipremnum aureum', wateringFrequency: 5 });
    const plants = await getPlants();
    expect(plants.length).toBeGreaterThan(0);
  });

  test('updates plant watering date', async () => {
    const plant = await addPlant({ name: 'Snake Plant', species: 'Sansevieria', wateringFrequency: 14 });
    const newDate = new Date().toISOString();
    await updatePlant(plant.id, { lastWatered: newDate });
    const updated = await getPlants();
    const found = updated.find((p: any) => p.id === plant.id);
    expect(found?.lastWatered).toBe(newDate);
  });

  test('deletes a plant', async () => {
    const plant = await addPlant({ name: 'Cactus', species: 'Cactaceae', wateringFrequency: 21 });
    await deletePlant(plant.id);
    const plants = await getPlants();
    expect(plants.find((p: any) => p.id === plant.id)).toBeUndefined();
  });
});
