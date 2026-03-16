import { createContext, useState } from 'react';

export const MedicationContext = createContext();

export const MedicationProvider = ({ children }) => {
  const [medications, setMedications] = useState([]);

  const addMedication = (medication) => {
    setMedications([...medications, medication]);
  };

  const updateMedication = (id, updatedMedication) => {
    setMedications(medications.map(med => med.id === id ? updatedMedication : med));
  };

  const deleteMedication = (id) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  return (
    <MedicationContext.Provider value={{ medications, addMedication, updateMedication, deleteMedication }}>
      {children}
    </MedicationContext.Provider>
  );
};
