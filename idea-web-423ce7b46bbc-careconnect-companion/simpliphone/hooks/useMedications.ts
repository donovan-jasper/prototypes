import { useState } from 'react';
import { addMedication, getMedications, getMedicationById, logAdherence, getAdherenceReport } from '../database/medications';
import { snoozeReminder } from '../services/notifications';

export const useMedications = () => {
  const [medications, setMedications] = useState([]);
  const [adherenceLog, setAdherenceLog] = useState([]);

  const loadMedications = async () => {
    const allMedications = await getMedications();
    setMedications(allMedications);
  };

  const addNewMedication = async (name, dosage, schedule, photo) => {
    const id = await addMedication(name, dosage, schedule, photo);
    await loadMedications();
    return id;
  };

  const logMedicationAdherence = async (medicationId, status, timestamp) => {
    await logAdherence(medicationId, status, timestamp);
    const report = await getAdherenceReport(medicationId, new Date().toISOString().split('T')[0], new Date().toISOString().split('T')[0]);
    setAdherenceLog(report);
  };

  const handleTaken = async (medicationId) => {
    await logAdherence(medicationId, 'taken', new Date().toISOString());
    await loadMedications();
  };

  const handleSkipped = async (medicationId) => {
    await logAdherence(medicationId, 'skipped', new Date().toISOString());
    await loadMedications();
  };

  const handleSnoozed = async (medicationId) => {
    await snoozeReminder(medicationId, 15);
    await logAdherence(medicationId, 'snoozed', new Date().toISOString());
    await loadMedications();
  };

  return {
    medications,
    adherenceLog,
    loadMedications,
    addNewMedication,
    logMedicationAdherence,
    handleTaken,
    handleSkipped,
    handleSnoozed,
  };
};
