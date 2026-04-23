export interface PreventiveCareRecommendation {
  ageRange: [number, number];
  gender: 'male' | 'female' | 'all';
  screenings: {
    type: string;
    name: string;
    frequency: 'annual' | 'biennial';
    description: string;
  }[];
}

export const PREVENTIVE_CARE_RECOMMENDATIONS: PreventiveCareRecommendation[] = [
  {
    ageRange: [40, 49],
    gender: 'female',
    screenings: [
      {
        type: 'mammogram',
        name: 'Mammogram',
        frequency: 'annual',
        description: 'Breast cancer screening'
      },
      {
        type: 'pap_smear',
        name: 'Pap Smear',
        frequency: 'annual',
        description: 'Cervical cancer screening'
      },
      {
        type: 'blood_pressure',
        name: 'Blood Pressure Check',
        frequency: 'annual',
        description: 'Hypertension screening'
      }
    ]
  },
  {
    ageRange: [40, 49],
    gender: 'male',
    screenings: [
      {
        type: 'prostate_exam',
        name: 'Prostate Exam',
        frequency: 'annual',
        description: 'Prostate cancer screening'
      },
      {
        type: 'blood_pressure',
        name: 'Blood Pressure Check',
        frequency: 'annual',
        description: 'Hypertension screening'
      }
    ]
  },
  {
    ageRange: [50, 59],
    gender: 'female',
    screenings: [
      {
        type: 'mammogram',
        name: 'Mammogram',
        frequency: 'annual',
        description: 'Breast cancer screening'
      },
      {
        type: 'pap_smear',
        name: 'Pap Smear',
        frequency: 'annual',
        description: 'Cervical cancer screening'
      },
      {
        type: 'blood_pressure',
        name: 'Blood Pressure Check',
        frequency: 'annual',
        description: 'Hypertension screening'
      },
      {
        type: 'colonoscopy',
        name: 'Colonoscopy',
        frequency: 'biennial',
        description: 'Colorectal cancer screening'
      }
    ]
  },
  {
    ageRange: [50, 59],
    gender: 'male',
    screenings: [
      {
        type: 'prostate_exam',
        name: 'Prostate Exam',
        frequency: 'annual',
        description: 'Prostate cancer screening'
      },
      {
        type: 'blood_pressure',
        name: 'Blood Pressure Check',
        frequency: 'annual',
        description: 'Hypertension screening'
      },
      {
        type: 'colonoscopy',
        name: 'Colonoscopy',
        frequency: 'biennial',
        description: 'Colorectal cancer screening'
      }
    ]
  },
  // Add more age/gender groups as needed
];
