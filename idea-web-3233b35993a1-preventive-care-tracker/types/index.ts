export interface FamilyMember {
  id: string;
  name: string;
  birthDate: string;
  relationship: string;
}

export interface Vaccination {
  id: string;
  memberId: string;
  name: string;
  date: string;
  provider: string;
}

export interface Prescription {
  id: string;
  memberId: string;
  name: string;
  dosage: string;
  date: string;
}

export interface Allergy {
  id: string;
  memberId: string;
  name: string;
  severity: string;
}

export interface Insurance {
  id: string;
  memberId: string;
  name: string;
  policyNumber: string;
  expirationDate: string;
}
