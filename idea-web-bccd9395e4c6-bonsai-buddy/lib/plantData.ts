const plantData = [
  {
    species: 'Monstera deliciosa',
    commonName: 'Swiss Cheese Plant',
    wateringFrequency: 7,
    lightRequirements: 'Bright, indirect light',
    toxicity: 'Low',
    tips: 'Rotate the plant regularly to ensure even growth.',
  },
  {
    species: 'Epipremnum aureum',
    commonName: 'Pothos',
    wateringFrequency: 5,
    lightRequirements: 'Low to bright, indirect light',
    toxicity: 'Low',
    tips: 'Cutting a pothos will encourage new growth.',
  },
  {
    species: 'Sansevieria trifasciata',
    commonName: 'Snake Plant',
    wateringFrequency: 14,
    lightRequirements: 'Low to bright, indirect light',
    toxicity: 'Low',
    tips: 'Snake plants thrive in neglect and can survive with minimal water.',
  },
];

const symptomData = [
  {
    symptom: 'Yellowing leaves',
    possibleCauses: ['Overwatering', 'Underwatering', 'Nutrient deficiency'],
    solutions: [
      { cause: 'Overwatering', solution: 'Check soil moisture before watering.' },
      { cause: 'Underwatering', solution: 'Ensure the plant is getting enough light.' },
      { cause: 'Nutrient deficiency', solution: 'Fertilize the plant with a balanced fertilizer.' },
    ],
  },
  {
    symptom: 'Drooping leaves',
    possibleCauses: ['Overwatering', 'Underwatering', 'Pests'],
    solutions: [
      { cause: 'Overwatering', solution: 'Check soil moisture before watering.' },
      { cause: 'Underwatering', solution: 'Ensure the plant is getting enough light.' },
      { cause: 'Pests', solution: 'Inspect the plant for pests and treat accordingly.' },
    ],
  },
];

export const getPlantCareGuide = (species: string) => {
  return plantData.find(plant => plant.species === species);
};

export const searchPlantSpecies = (query: string) => {
  return plantData.filter(plant =>
    plant.species.toLowerCase().includes(query.toLowerCase()) ||
    plant.commonName.toLowerCase().includes(query.toLowerCase())
  );
};

export const getSymptomSolutions = (symptom: string) => {
  const symptomInfo = symptomData.find(item => item.symptom.toLowerCase() === symptom.toLowerCase());
  return symptomInfo ? symptomInfo.solutions : [];
};
