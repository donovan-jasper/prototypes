import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('carequest.db');

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

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS family_members (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            birthDate TEXT NOT NULL,
            relationship TEXT NOT NULL
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS vaccinations (
            id TEXT PRIMARY KEY,
            memberId TEXT NOT NULL,
            name TEXT NOT NULL,
            date TEXT NOT NULL,
            provider TEXT,
            FOREIGN KEY(memberId) REFERENCES family_members(id)
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS prescriptions (
            id TEXT PRIMARY KEY,
            memberId TEXT NOT NULL,
            name TEXT NOT NULL,
            dosage TEXT NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY(memberId) REFERENCES family_members(id)
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS allergies (
            id TEXT PRIMARY KEY,
            memberId TEXT NOT NULL,
            name TEXT NOT NULL,
            severity TEXT NOT NULL,
            FOREIGN KEY(memberId) REFERENCES family_members(id)
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS insurance (
            id TEXT PRIMARY KEY,
            memberId TEXT NOT NULL,
            name TEXT NOT NULL,
            policyNumber TEXT NOT NULL,
            expirationDate TEXT NOT NULL,
            FOREIGN KEY(memberId) REFERENCES family_members(id)
          );`
        );
      },
      (error) => reject(error),
      () => resolve(true)
    );
  });
};

// Family Members
export const getFamilyMembers = async (): Promise<FamilyMember[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM family_members;',
          [],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      }
    );
  });
};

// Vaccinations
export const getVaccinations = async (memberId: string): Promise<Vaccination[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM vaccinations WHERE memberId = ?;',
          [memberId],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getVaccination = async (id: string): Promise<Vaccination | null> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM vaccinations WHERE id = ?;',
          [id],
          (_, { rows }) => resolve(rows._array.length > 0 ? rows._array[0] : null),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const addVaccination = async (vaccination: Omit<Vaccination, 'id'>): Promise<Vaccination> => {
  const id = Date.now().toString();
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO vaccinations (id, memberId, name, date, provider) VALUES (?, ?, ?, ?, ?);',
          [id, vaccination.memberId, vaccination.name, vaccination.date, vaccination.provider],
          () => resolve({ id, ...vaccination }),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const updateVaccination = async (vaccination: Vaccination): Promise<Vaccination> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'UPDATE vaccinations SET name = ?, date = ?, provider = ? WHERE id = ?;',
          [vaccination.name, vaccination.date, vaccination.provider, vaccination.id],
          () => resolve(vaccination),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const deleteVaccination = async (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM vaccinations WHERE id = ?;',
          [id],
          () => resolve(),
          (_, error) => reject(error)
        );
      }
    );
  });
};

// Prescriptions
export const getPrescriptions = async (memberId: string): Promise<Prescription[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM prescriptions WHERE memberId = ?;',
          [memberId],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getPrescription = async (id: string): Promise<Prescription | null> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM prescriptions WHERE id = ?;',
          [id],
          (_, { rows }) => resolve(rows._array.length > 0 ? rows._array[0] : null),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const addPrescription = async (prescription: Omit<Prescription, 'id'>): Promise<Prescription> => {
  const id = Date.now().toString();
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO prescriptions (id, memberId, name, dosage, date) VALUES (?, ?, ?, ?, ?);',
          [id, prescription.memberId, prescription.name, prescription.dosage, prescription.date],
          () => resolve({ id, ...prescription }),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const updatePrescription = async (prescription: Prescription): Promise<Prescription> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'UPDATE prescriptions SET name = ?, dosage = ?, date = ? WHERE id = ?;',
          [prescription.name, prescription.dosage, prescription.date, prescription.id],
          () => resolve(prescription),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const deletePrescription = async (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM prescriptions WHERE id = ?;',
          [id],
          () => resolve(),
          (_, error) => reject(error)
        );
      }
    );
  });
};

// Allergies
export const getAllergies = async (memberId: string): Promise<Allergy[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM allergies WHERE memberId = ?;',
          [memberId],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getAllergy = async (id: string): Promise<Allergy | null> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM allergies WHERE id = ?;',
          [id],
          (_, { rows }) => resolve(rows._array.length > 0 ? rows._array[0] : null),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const addAllergy = async (allergy: Omit<Allergy, 'id'>): Promise<Allergy> => {
  const id = Date.now().toString();
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO allergies (id, memberId, name, severity) VALUES (?, ?, ?, ?);',
          [id, allergy.memberId, allergy.name, allergy.severity],
          () => resolve({ id, ...allergy }),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const updateAllergy = async (allergy: Allergy): Promise<Allergy> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'UPDATE allergies SET name = ?, severity = ? WHERE id = ?;',
          [allergy.name, allergy.severity, allergy.id],
          () => resolve(allergy),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const deleteAllergy = async (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM allergies WHERE id = ?;',
          [id],
          () => resolve(),
          (_, error) => reject(error)
        );
      }
    );
  });
};

// Insurance
export const getInsurance = async (memberId: string): Promise<Insurance[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM insurance WHERE memberId = ?;',
          [memberId],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getInsuranceById = async (id: string): Promise<Insurance | null> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM insurance WHERE id = ?;',
          [id],
          (_, { rows }) => resolve(rows._array.length > 0 ? rows._array[0] : null),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const addInsurance = async (insurance: Omit<Insurance, 'id'>): Promise<Insurance> => {
  const id = Date.now().toString();
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO insurance (id, memberId, name, policyNumber, expirationDate) VALUES (?, ?, ?, ?, ?);',
          [id, insurance.memberId, insurance.name, insurance.policyNumber, insurance.expirationDate],
          () => resolve({ id, ...insurance }),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const updateInsurance = async (insurance: Insurance): Promise<Insurance> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'UPDATE insurance SET name = ?, policyNumber = ?, expirationDate = ? WHERE id = ?;',
          [insurance.name, insurance.policyNumber, insurance.expirationDate, insurance.id],
          () => resolve(insurance),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const deleteInsurance = async (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM insurance WHERE id = ?;',
          [id],
          () => resolve(),
          (_, error) => reject(error)
        );
      }
    );
  });
};
