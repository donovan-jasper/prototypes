const plantData = [
  {
    species: 'Monstera deliciosa',
    commonName: 'Swiss Cheese Plant',
    wateringFrequency: 7,
    lightRequirements: 'Bright, indirect light',
    toxicity: 'Low',
    tips: 'Rotate the plant regularly to ensure even growth.',
    careGuide: 'Water when the top 2 inches of soil are dry. Fertilize every 4-6 weeks during growing season.'
  },
  {
    species: 'Epipremnum aureum',
    commonName: 'Pothos',
    wateringFrequency: 5,
    lightRequirements: 'Low to bright, indirect light',
    toxicity: 'Low',
    tips: 'Cutting a pothos will encourage new growth.',
    careGuide: 'Water when the top inch of soil is dry. Can tolerate lower light conditions.'
  },
  {
    species: 'Sansevieria trifasciata',
    commonName: 'Snake Plant',
    wateringFrequency: 14,
    lightRequirements: 'Low to bright, indirect light',
    toxicity: 'Low',
    tips: 'Snake plants thrive in neglect and can survive with minimal water.',
    careGuide: 'Water every 2-3 weeks. Can go weeks without water in dry climates.'
  },
  {
    species: 'Ficus lyrata',
    commonName: 'Fiddle Leaf Fig',
    wateringFrequency: 7,
    lightRequirements: 'Bright, indirect light',
    toxicity: 'Moderate',
    tips: 'Avoid direct sunlight which can scorch leaves.',
    careGuide: 'Water when top 2 inches of soil are dry. Fertilize monthly during growing season.'
  },
  {
    species: 'Zamioculcas zamiifolia',
    commonName: 'ZZ Plant',
    wateringFrequency: 14,
    lightRequirements: 'Low to bright, indirect light',
    toxicity: 'Low',
    tips: 'Very drought tolerant once established.',
    careGuide: 'Water every 2-3 weeks. Can survive with minimal care.'
  },
  {
    species: 'Peperomia obtusifolia',
    commonName: 'Baby Rubber Plant',
    wateringFrequency: 7,
    lightRequirements: 'Bright, indirect light',
    toxicity: 'Low',
    tips: 'Great for beginners due to hardiness.',
    careGuide: 'Water when soil is dry to touch. Fertilize every 4-6 weeks.'
  },
  {
    species: 'Haworthiopsis attenuata',
    commonName: 'Zebra Plant',
    wateringFrequency: 14,
    lightRequirements: 'Bright, direct light',
    toxicity: 'Low',
    tips: 'Needs well-draining soil to prevent rot.',
    careGuide: 'Water sparingly - only when soil is completely dry.'
  },
  {
    species: 'Dracaena marginata',
    commonName: 'Dragon Tree',
    wateringFrequency: 10,
    lightRequirements: 'Bright, indirect light',
    toxicity: 'Low',
    tips: 'Tall and elegant plant that adds height to rooms.',
    careGuide: 'Water when top 2 inches of soil are dry. Can tolerate lower humidity.'
  },
  {
    species: 'Philodendron hederaceum',
    commonName: 'Heartleaf Philodendron',
    wateringFrequency: 5,
    lightRequirements: 'Low to bright, indirect light',
    toxicity: 'Low',
    tips: 'Great for hanging baskets or trailing plants.',
    careGuide: 'Water when top inch of soil is dry. Can tolerate lower light.'
  },
  {
    species: 'Calathea orbifolia',
    commonName: 'Prayer Plant',
    wateringFrequency: 5,
    lightRequirements: 'Bright, indirect light',
    toxicity: 'Low',
    tips: 'Needs high humidity to prevent leaf browning.',
    careGuide: 'Water when top inch of soil is dry. Mist leaves regularly.'
  },
  {
    species: 'Monstera adansonii',
    commonName: 'Tongue Plant',
    wateringFrequency: 7,
    lightRequirements: 'Bright, indirect light',
    toxicity: 'Low',
    tips: 'Similar to Swiss Cheese Plant but with different leaf patterns.',
    careGuide: 'Water when top 2 inches of soil are dry. Rotate plant regularly.'
  },
  {
    species: 'Schefflera arboricola',
    commonName: 'Umbrella Tree',
    wateringFrequency: 7,
    lightRequirements: 'Bright, indirect light',
    toxicity: 'Low',
    tips: 'Great for adding height and texture to rooms.',
    careGuide: 'Water when top 2 inches of soil are dry. Prune to maintain shape.'
  },
  {
    species: 'Chamaedorea elegans',
    commonName: 'Parlor Palm',
    wateringFrequency: 10,
    lightRequirements: 'Low to bright, indirect light',
    toxicity: 'Low',
    tips: 'Compact palm that's great for small spaces.',
    careGuide: 'Water when top 2 inches of soil are dry. Avoid overwatering.'
  },
  {
    species: 'Spathiphyllum wallisii',
    commonName: 'Peace Lily',
    wateringFrequency: 5,
    lightRequirements: 'Low to bright, indirect light',
    toxicity: 'Low',
    tips: 'Produces beautiful white flowers and is great for air purification.',
    careGuide: 'Water when top inch of soil is dry. Prefers moderate humidity.'
  },
  {
    species: 'Dracaena fragrans',
    commonName: 'Corn Plant',
    wateringFrequency: 14,
    lightRequirements: 'Bright, indirect light',
    toxicity: 'Low',
    tips: 'Tall and architectural plant that adds height to rooms.',
    careGuide: 'Water every 2-3 weeks. Can tolerate lower humidity.'
  },
  {
    species: 'Epipremnum pinnatum',
    commonName: 'Brass Pothos',
    wateringFrequency: 5,
    lightRequirements: 'Low to bright, indirect light',
    toxicity: 'Low',
    tips: 'Similar to regular pothos but with variegated leaves.',
    careGuide: 'Water when top inch of soil is dry. Can tolerate lower light.'
  },
  {
    species: 'Hedera helix',
    commonName: 'English Ivy',
    wateringFrequency: 5,
    lightRequirements: 'Bright, indirect light',
    toxicity: 'Low',
    tips: 'Great for climbing or trailing plants.',
    careGuide: 'Water when top inch of soil is dry. Prune to maintain shape.'
  },
  {
    species: 'Ficus benjamina',
    commonName: 'Weeping Fig',
    wateringFrequency: 7,
    lightRequirements: 'Bright, indirect light',
    toxicity: 'Moderate',
    tips: 'Dramatic plant with cascading leaves.',
    careGuide: 'Water when top 2 inches of soil are dry. Fertilize monthly.'
  },
  {
    species: 'Dieffenbachia amoena',
    commonName: 'Dumcane',
    wateringFrequency: 5,
    lightRequirements: 'Bright, indirect light',
    toxicity: 'Moderate',
    tips: 'Needs well-draining soil to prevent rot.',
    careGuide: 'Water when top inch of soil is dry. Avoid overwatering.'
  },
  {
    species: 'Anthurium andraeanum',
    commonName: 'Flamingo Flower',
    wateringFrequency: 5,
    lightRequirements: 'Bright, indirect light',
    toxicity: 'Low',
    tips: 'Produces beautiful red or pink flowers.',
    careGuide: 'Water when top inch of soil is dry. Prefers high humidity.'
  },
  {
    species: 'Syngonium podophyllum',
    commonName: 'Arrowhead Plant',
    wateringFrequency: 5,
    lightRequirements: 'Bright, indirect light',
    toxicity: 'Low',
    tips: 'Great for hanging baskets or trailing plants.',
    careGuide: 'Water when top inch of soil is dry. Can tolerate lower light.'
  },
  {
    species: 'Pilea peperomioides',
    commonName: 'Chinese Money Plant',
    wateringFrequency: 7,
    lightRequirements: 'Bright, indirect light',
    toxicity: 'Low',
    tips: 'Produces small round leaves that resemble coins.',
    careGuide: 'Water when top 2 inches of soil are dry. Can tolerate lower light.'
  },
  {
    species: 'Crassula ovata',
    commonName: 'Jade Plant',
    wateringFrequency: 14,
    lightRequirements: 'Bright, direct light',
    toxicity: 'Low',
    tips: 'Succulent that's very drought tolerant.',
    careGuide: 'Water every 2-3 weeks. Can go weeks without water.'
  },
  {
    species: 'Echeveria elegans',
    commonName: 'Mexican Snowball',
    wateringFrequency: 14,
    lightRequirements: 'Bright, direct light',
    toxicity: 'Low',
    tips: 'Succulent with rosette-shaped leaves.',
    careGuide: 'Water every 2-3 weeks. Can tolerate lower humidity.'
  },
  {
    species: 'Kalanchoe blossfeldiana',
    commonName: 'Kalanchoe',
    wateringFrequency: 7,
    lightRequirements: 'Bright, direct light',
    toxicity: 'Low',
    tips: 'Succulent with colorful flowers.',
    careGuide: 'Water when top inch of soil is dry. Can tolerate lower humidity.'
  },
  {
    species: 'Sedum morganianum',
    commonName: 'Stonecrop',
    wateringFrequency: 14,
    lightRequirements: 'Bright, direct light',
    toxicity: 'Low',
    tips: 'Succulent with fleshy leaves that store water.',
    careGuide: 'Water every 2-3 weeks. Can tolerate lower humidity.'
  },
  {
    species: 'Aloe vera',
    commonName: 'Aloe',
    wateringFrequency: 14,
    lightRequirements: 'Bright, direct light',
    toxicity: 'Moderate',
    tips: 'Succulent with gel that can be used for skin care.',
    careGuide: 'Water every 2-3 weeks. Can tolerate lower humidity.'
  },
  {
    species: 'Agave americana',
    commonName: 'Century Plant',
    wateringFrequency: 14,
    lightRequirements: 'Bright, direct light',
    toxicity: 'Moderate',
    tips: 'Succulent that takes many years to bloom.',
    careGuide: 'Water every 2-3 weeks. Can tolerate lower humidity.'
  },
  {
    species: 'Haworthiopsis limifolia',
    commonName: 'Hens and Chicks',
    wateringFrequency: 14,
    lightRequirements: 'Bright, direct light',
    toxicity: 'Low',
    tips: 'Succulent with unique leaf patterns.',
    careGuide: 'Water every 2-3 weeks. Can tolerate lower humidity.'
  },
  {
    species: 'Graptoveria gypsophila',
    commonName: 'Baby's Tears',
    wateringFrequency: 14,
    lightRequirements: 'Bright, direct light',
    toxicity: 'Low',
    tips: 'Succulent with trailing stems.',
    careGuide: 'Water every 2-3 weeks. Can tolerate lower humidity.'
  },
  {
    species: 'Sempervivum arachnoideum',
    commonName: 'Spider Plant',
    wateringFrequency: 14,
    lightRequirements: 'Bright, direct light',
    toxicity: 'Low',
    tips: 'Succulent with rosette-shaped leaves.',
    careGuide: 'Water every 2-3 weeks. Can tolerate lower humidity.'
  },
  {
    species: 'Sedum rubrotinctum',
    commonName: 'Red Stemmed Stonecrop',
    wateringFrequency: 14,
    lightRequirements: 'Bright, direct light',
    toxicity: 'Low',
    tips: 'Succulent with red stems.',
    careGuide: 'Water every 2-3 weeks. Can tolerate lower humidity.'
  },
  {
    species: 'Echeveria pulchra',
    commonName: 'Mexican Snowball',
    wateringFrequency: 14,
    lightRequirements: 'Bright, direct light',
    toxicity: 'Low',
    tips: 'Succulent with rosette-shaped leaves.',
    careGuide: 'Water every 2-3 weeks. Can tolerate lower humidity.'
  },
  {
    species: 'Graptopetalum paraguayense',
    commonName: 'Peacock Plant',
    wateringFrequency: 7,
    lightRequirements: 'Bright, indirect light',
    toxicity: 'Low',
    tips: 'Succulent with colorful flowers.',
    careGuide: 'Water when top inch of soil is dry. Can tolerate lower humidity.'
  },
  {
    species: 'Sedum morganianum',
    commonName: 'Stonecrop',
    wateringFrequency: 14,
    lightRequirements: 'Bright, direct light',
    toxicity: 'Low',
    tips: 'Succulent with fleshy leaves that store water.',
    careGuide: 'Water every 2-3 weeks. Can tolerate lower humidity.'
  },
  {
    species: 'Aloe vera',
    commonName: 'Aloe',
    wateringFrequency: 14,
    lightRequirements: 'Bright, direct light',
    toxicity: 'Moderate',
    tips: 'Succulent with gel that can be used for skin care.',
    careGuide: 'Water every 2-3 weeks. Can tolerate lower humidity.'
  },
  {
    species: 'Agave americana',
    commonName: 'Century Plant',
    wateringFrequency: 14,
    lightRequirements: 'Bright, direct light',
    toxicity: 'Moderate',
    tips: 'Succulent that takes many years to bloom.',
    careGuide: 'Water every 2-3 weeks. Can tolerate lower humidity.'
  },
  {
    species: 'Haworthiopsis limifolia',
    commonName: 'Hens and Chicks',
    wateringFrequency: 14,
    lightRequirements: 'Bright, direct light',
    toxicity: 'Low',
    tips: 'Succulent with unique leaf patterns.',
    careGuide: 'Water every 2-3 weeks. Can tolerate lower humidity.'
  },
  {
    species: 'Graptoveria gypsophila',
    commonName: 'Baby's Tears',
    wateringFrequency: 14,
    lightRequirements: 'Bright, direct light',
    toxicity: 'Low',
    tips: 'Succulent with trailing stems.',
    careGuide: 'Water every 2-3 weeks. Can tolerate lower humidity.'
  },
  {
    species: 'Sempervivum arachnoideum',
    commonName: 'Spider Plant',
    wateringFrequency: 14,
    lightRequirements: 'Bright, direct light',
    toxicity: 'Low',
    tips: 'Succulent with rosette-shaped leaves.',
    careGuide: 'Water every 2-3 weeks. Can tolerate lower humidity.'
  },
  {
    species: 'Sedum rubrotinctum',
    commonName: 'Red Stemmed Stonecrop',
    wateringFrequency: 14,
    lightRequirements: 'Bright, direct light',
    toxicity: 'Low',
    tips: 'Succulent with red stems.',
    careGuide: 'Water every 2-3 weeks. Can tolerate lower humidity.'
  },
  {
    species: 'Echeveria pulchra',
    commonName: 'Mexican Snowball',
    wateringFrequency: 14,
    lightRequirements: 'Bright, direct light',
    toxicity: 'Low',
    tips: 'Succulent with rosette-shaped leaves.',
    careGuide: 'Water every 2-3 weeks. Can tolerate lower humidity.'
  },
  {
    species: 'Graptopetalum paraguayense',
    commonName: 'Peacock Plant',
    wateringFrequency: 7,
    lightRequirements: 'Bright, indirect light',
    toxicity: 'Low',
    tips: 'Succulent with colorful flowers.',
    careGuide: 'Water when top inch of soil is dry. Can tolerate lower humidity.'
  }
];

const symptomData = [
  {
    symptom: 'Yellowing leaves',
    possibleCauses: ['Overwatering', 'Underwatering', 'Nutrient deficiency', 'Pests', 'Disease'],
    solutions: [
      { cause: 'Overwatering', solution: 'Check soil moisture before watering. Allow soil to dry between waterings.' },
      { cause: 'Underwatering', solution: 'Increase watering frequency or provide more light.' },
      { cause: 'Nutrient deficiency', solution: 'Fertilize the plant with a balanced fertilizer.' },
      { cause: 'Pests', solution: 'Inspect the plant for pests and treat accordingly.' },
      { cause: 'Disease', solution: 'Remove affected leaves and treat with appropriate fungicide.' }
    ],
  },
  {
    symptom: 'Drooping leaves',
    possibleCauses: ['Overwatering', 'Underwatering', 'Pests', 'Disease', 'Low humidity'],
    solutions: [
      { cause: 'Overwatering', solution: 'Check soil moisture before watering. Allow soil to dry between waterings.' },
      { cause: 'Underwatering', solution: 'Increase watering frequency or provide more light.' },
      { cause: 'Pests', solution: 'Inspect the plant for pests and treat accordingly.' },
      { cause: 'Disease', solution: 'Remove affected leaves and treat with appropriate fungicide.' },
      { cause: 'Low humidity', solution: 'Increase humidity around the plant or mist leaves regularly.' }
    ],
  },
  {
    symptom: 'Brown leaf tips',
    possibleCauses: ['Overwatering', 'Underwatering', 'Pests', 'Disease', 'Low humidity'],
    solutions: [
      { cause: 'Overwatering', solution: 'Check soil moisture before watering. Allow soil to dry between waterings.' },
      { cause: 'Underwatering', solution: 'Increase watering frequency or provide more light.' },
      { cause: 'Pests', solution: 'Inspect the plant for pests and treat accordingly.' },
      { cause: 'Disease', solution: 'Remove affected leaves and treat with appropriate fungicide.' },
      { cause: 'Low humidity', solution: 'Increase humidity around the plant or mist leaves regularly.' }
    ],
  },
  {
    symptom: 'Brown leaf edges',
    possibleCauses: ['Overwatering', 'Underwatering', 'Pests', 'Disease', 'Low humidity'],
    solutions: [
      { cause: 'Overwatering', solution: 'Check soil moisture before watering. Allow soil to dry between waterings.' },
      { cause: 'Underwatering', solution: 'Increase watering frequency or provide more light.' },
      { cause: 'Pests', solution: 'Inspect the plant for pests and treat accordingly.' },
      { cause: 'Disease', solution: 'Remove affected leaves and treat with appropriate fungicide.' },
      { cause: 'Low humidity', solution: 'Increase humidity around the plant or mist leaves regularly.' }
    ],
  },
  {
    symptom: 'Wilting',
    possibleCauses: ['Overwatering', 'Underwatering', 'Pests', 'Disease', 'Low humidity'],
    solutions: [
      { cause: 'Overwatering', solution: 'Check soil moisture before watering. Allow soil to dry between waterings.' },
      { cause: 'Underwatering', solution: 'Increase watering frequency or provide more light.' },
      { cause: 'Pests', solution: 'Inspect the plant for pests and treat accordingly.' },
      { cause: 'Disease', solution: 'Remove affected leaves and treat with appropriate fungicide.' },
      { cause: 'Low humidity', solution: 'Increase humidity around the plant or mist leaves regularly.' }
    ],
  },
  {
    symptom: 'Mold',
    possibleCauses: ['Overwatering', 'Poor drainage', 'High humidity', 'Disease'],
    solutions: [
      { cause: 'Overwatering', solution: 'Check soil moisture before watering. Allow soil to dry between waterings.' },
      { cause: 'Poor drainage', solution: 'Repot the plant in well-draining soil.' },
      { cause: 'High humidity', solution: 'Decrease humidity around the plant or improve air circulation.' },
      { cause: 'Disease', solution: 'Remove affected leaves and treat with appropriate fungicide.' }
    ],
  },
  {
    symptom: 'Pests',
    possibleCauses: ['Overwatering', 'Poor air circulation', 'High humidity', 'Disease'],
    solutions: [
      { cause: 'Overwatering', solution: 'Check soil moisture before watering. Allow soil to dry between waterings.' },
      { cause: 'Poor air circulation', solution: 'Improve air circulation around the plant.' },
      { cause: 'High humidity', solution: 'Decrease humidity around the plant or improve air circulation.' },
      { cause: 'Disease', solution: 'Remove affected leaves and treat with appropriate fungicide.' }
    ],
  },
  {
    symptom: 'Disease',
    possibleCauses: ['Overwatering', 'Poor air circulation', 'High humidity', 'Pests'],
    solutions: [
      { cause: 'Overwatering', solution: 'Check soil moisture before watering. Allow soil to dry between waterings.' },
      { cause: 'Poor air circulation', solution: 'Improve air circulation around the plant.' },
      { cause: 'High humidity', solution: 'Decrease humidity around the plant or improve air circulation.' },
      { cause: 'Pests', solution: 'Inspect the plant for pests and treat accordingly.' }
    ],
  },
  {
    symptom: 'Slow growth',
    possibleCauses: ['Underwatering', 'Poor light', 'Nutrient deficiency', 'Pests', 'Disease'],
    solutions: [
      { cause: 'Underwatering', solution: 'Increase watering frequency or provide more light.' },
      { cause: 'Poor light', solution: 'Move the plant to a brighter location.' },
      { cause: 'Nutrient deficiency', solution: 'Fertilize the plant with a balanced fertilizer.' },
      { cause: 'Pests', solution: 'Inspect the plant for pests and treat accordingly.' },
      { cause: 'Disease', solution: 'Remove affected leaves and treat with appropriate fungicide.' }
    ],
  },
  {
    symptom: 'Leggy growth',
    possibleCauses: ['Underwatering', 'Poor light', 'Nutrient deficiency', 'Pests', 'Disease'],
    solutions: [
      { cause: 'Underwatering', solution: 'Increase watering frequency or provide more light.' },
      { cause: 'Poor light', solution: 'Move the plant to a brighter location.' },
      { cause: 'Nutrient deficiency', solution: 'Fertilize the plant with a balanced fertilizer.' },
      { cause: 'Pests', solution: 'Inspect the plant for pests and treat accordingly.' },
      { cause: 'Disease', solution: 'Remove affected leaves and treat with appropriate fungicide.' }
    ],
  }
];

export const getPlantCareGuide = (species: string) => {
  return plantData.find(plant => plant.species.toLowerCase() === species.toLowerCase());
};

export const searchPlantSpecies = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return plantData.filter(plant =>
    plant.species.toLowerCase().includes(lowerQuery) ||
    plant.commonName.toLowerCase().includes(lowerQuery)
  );
};

export const getSymptomSolutions = (symptom: string) => {
  const symptomInfo = symptomData.find(item => item.symptom.toLowerCase() === symptom.toLowerCase());
  return symptomInfo ? symptomInfo.solutions : [];
};

export const getAllPlants = () => {
  return plantData;
};
