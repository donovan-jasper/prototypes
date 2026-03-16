export const preventiveCareRecommendations = [
  {
    age: '18-24',
    gender: 'male',
    screenings: [
      { type: 'blood_pressure', frequency: 'annual' },
      { type: 'cholesterol', frequency: 'annual' },
      { type: 'colorectal_cancer', frequency: 'every 5 years starting at 45' },
      { type: 'prostate_cancer', frequency: 'every 5 years starting at 50' },
    ],
  },
  {
    age: '18-24',
    gender: 'female',
    screenings: [
      { type: 'blood_pressure', frequency: 'annual' },
      { type: 'cholesterol', frequency: 'annual' },
      { type: 'mammogram', frequency: 'every 2 years starting at 40' },
      { type: 'colorectal_cancer', frequency: 'every 5 years starting at 45' },
      { type: 'pap_smear', frequency: 'every 3 years starting at 21' },
      { type: 'breast_cancer', frequency: 'every 2 years starting at 40' },
    ],
  },
  {
    age: '25-34',
    gender: 'male',
    screenings: [
      { type: 'blood_pressure', frequency: 'annual' },
      { type: 'cholesterol', frequency: 'annual' },
      { type: 'colorectal_cancer', frequency: 'every 5 years starting at 45' },
      { type: 'prostate_cancer', frequency: 'every 5 years starting at 50' },
    ],
  },
  {
    age: '25-34',
    gender: 'female',
    screenings: [
      { type: 'blood_pressure', frequency: 'annual' },
      { type: 'cholesterol', frequency: 'annual' },
      { type: 'mammogram', frequency: 'every 2 years starting at 40' },
      { type: 'colorectal_cancer', frequency: 'every 5 years starting at 45' },
      { type: 'pap_smear', frequency: 'every 3 years starting at 21' },
      { type: 'breast_cancer', frequency: 'every 2 years starting at 40' },
    ],
  },
  {
    age: '35-44',
    gender: 'male',
    screenings: [
      { type: 'blood_pressure', frequency: 'annual' },
      { type: 'cholesterol', frequency: 'annual' },
      { type: 'colorectal_cancer', frequency: 'every 5 years starting at 45' },
      { type: 'prostate_cancer', frequency: 'every 5 years starting at 50' },
    ],
  },
  {
    age: '35-44',
    gender: 'female',
    screenings: [
      { type: 'blood_pressure', frequency: 'annual' },
      { type: 'cholesterol', frequency: 'annual' },
      { type: 'mammogram', frequency: 'every 2 years starting at 40' },
      { type: 'colorectal_cancer', frequency: 'every 5 years starting at 45' },
      { type: 'pap_smear', frequency: 'every 3 years starting at 21' },
      { type: 'breast_cancer', frequency: 'every 2 years starting at 40' },
    ],
  },
  {
    age: '45-54',
    gender: 'male',
    screenings: [
      { type: 'blood_pressure', frequency: 'annual' },
      { type: 'cholesterol', frequency: 'annual' },
      { type: 'colorectal_cancer', frequency: 'every 5 years starting at 45' },
      { type: 'prostate_cancer', frequency: 'every 5 years starting at 50' },
    ],
  },
  {
    age: '45-54',
    gender: 'female',
    screenings: [
      { type: 'blood_pressure', frequency: 'annual' },
      { type: 'cholesterol', frequency: 'annual' },
      { type: 'mammogram', frequency: 'every 2 years starting at 40' },
      { type: 'colorectal_cancer', frequency: 'every 5 years starting at 45' },
      { type: 'pap_smear', frequency: 'every 3 years starting at 21' },
      { type: 'breast_cancer', frequency: 'every 2 years starting at 40' },
    ],
  },
  {
    age: '55-64',
    gender: 'male',
    screenings: [
      { type: 'blood_pressure', frequency: 'annual' },
      { type: 'cholesterol', frequency: 'annual' },
      { type: 'colorectal_cancer', frequency: 'every 5 years starting at 45' },
      { type: 'prostate_cancer', frequency: 'every 5 years starting at 50' },
    ],
  },
  {
    age: '55-64',
    gender: 'female',
    screenings: [
      { type: 'blood_pressure', frequency: 'annual' },
      { type: 'cholesterol', frequency: 'annual' },
      { type: 'mammogram', frequency: 'every 2 years starting at 40' },
      { type: 'colorectal_cancer', frequency: 'every 5 years starting at 45' },
      { type: 'pap_smear', frequency: 'every 3 years starting at 21' },
      { type: 'breast_cancer', frequency: 'every 2 years starting at 40' },
    ],
  },
  {
    age: '65+',
    gender: 'male',
    screenings: [
      { type: 'blood_pressure', frequency: 'annual' },
      { type: 'cholesterol', frequency: 'annual' },
      { type: 'colorectal_cancer', frequency: 'every 5 years starting at 45' },
      { type: 'prostate_cancer', frequency: 'every 5 years starting at 50' },
    ],
  },
  {
    age: '65+',
    gender: 'female',
    screenings: [
      { type: 'blood_pressure', frequency: 'annual' },
      { type: 'cholesterol', frequency: 'annual' },
      { type: 'mammogram', frequency: 'every 2 years starting at 40' },
      { type: 'colorectal_cancer', frequency: 'every 5 years starting at 45' },
      { type: 'pap_smear', frequency: 'every 3 years starting at 21' },
      { type: 'breast_cancer', frequency: 'every 2 years starting at 40' },
    ],
  },
];

export const getScreeningsForUser = (age, gender) => {
  let ageRange;
  if (age < 25) ageRange = '18-24';
  else if (age < 35) ageRange = '25-34';
  else if (age < 45) ageRange = '35-44';
  else if (age < 55) ageRange = '45-54';
  else if (age < 65) ageRange = '55-64';
  else ageRange = '65+';

  const recommendation = preventiveCareRecommendations.find(
    rec => rec.age === ageRange && rec.gender === gender
  );

  return recommendation ? recommendation.screenings : [];
};
