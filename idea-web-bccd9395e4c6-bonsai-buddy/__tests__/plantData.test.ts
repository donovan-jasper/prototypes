import { getPlantCareGuide, searchPlantSpecies, getSymptomSolutions, getAllPlants } from '../lib/plantData';

describe('Plant data library', () => {
  test('retrieves care guide for known species', () => {
    const guide = getPlantCareGuide('Monstera deliciosa');
    expect(guide).toBeDefined();
    expect(guide?.wateringFrequency).toBeGreaterThan(0);
    expect(guide?.commonName).toBe('Swiss Cheese Plant');
  });

  test('returns undefined for unknown species', () => {
    const guide = getPlantCareGuide('Unknown Plant');
    expect(guide).toBeUndefined();
  });

  test('searches plant species by name (case insensitive)', () => {
    const results = searchPlantSpecies('monstera');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].commonName.toLowerCase()).toContain('monstera');

    const results2 = searchPlantSpecies('Swiss Cheese');
    expect(results2.length).toBeGreaterThan(0);
    expect(results2[0].species).toBe('Monstera deliciosa');
  });

  test('returns empty array for no matches', () => {
    const results = searchPlantSpecies('xyz123');
    expect(results.length).toBe(0);
  });

  test('provides solutions for common symptoms', () => {
    const solutions = getSymptomSolutions('yellowing leaves');
    expect(solutions.length).toBeGreaterThan(0);
    expect(solutions[0].cause).toBeDefined();
    expect(solutions[0].solution).toBeDefined();
  });

  test('returns empty array for unknown symptoms', () => {
    const solutions = getSymptomSolutions('unknown symptom');
    expect(solutions.length).toBe(0);
  });

  test('gets all plants', () => {
    const plants = getAllPlants();
    expect(plants.length).toBeGreaterThan(50);
    expect(plants[0].species).toBeDefined();
    expect(plants[0].commonName).toBeDefined();
  });

  test('plant data includes required fields', () => {
    const plants = getAllPlants();
    plants.forEach(plant => {
      expect(plant.species).toBeDefined();
      expect(plant.commonName).toBeDefined();
      expect(plant.wateringFrequency).toBeGreaterThan(0);
      expect(plant.lightRequirements).toBeDefined();
      expect(plant.toxicity).toBeDefined();
      expect(plant.tips).toBeDefined();
      expect(plant.careGuide).toBeDefined();
    });
  });

  test('symptom data includes required fields', () => {
    const solutions = getSymptomSolutions('yellowing leaves');
    solutions.forEach(solution => {
      expect(solution.cause).toBeDefined();
      expect(solution.solution).toBeDefined();
    });
  });
});
