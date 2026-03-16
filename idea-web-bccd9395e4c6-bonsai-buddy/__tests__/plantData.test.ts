import { getPlantCareGuide, searchPlantSpecies, getSymptomSolutions } from '../lib/plantData';

describe('Plant data library', () => {
  test('retrieves care guide for known species', () => {
    const guide = getPlantCareGuide('Monstera deliciosa');
    expect(guide).toBeDefined();
    expect(guide?.wateringFrequency).toBeGreaterThan(0);
  });

  test('searches plant species by name', () => {
    const results = searchPlantSpecies('monstera');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].commonName.toLowerCase()).toContain('monstera');
  });

  test('provides solutions for common symptoms', () => {
    const solutions = getSymptomSolutions('yellowing leaves');
    expect(solutions.length).toBeGreaterThan(0);
    expect(solutions[0].cause).toBeDefined();
  });
});
