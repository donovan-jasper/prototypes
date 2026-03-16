import { useState } from 'react';
import { addPlant, getPlants, updatePlant, deletePlant } from '../lib/database';
import { saveImage } from '../lib/storage';
import { scheduleWateringReminder } from '../lib/notifications';

export const usePlants = () => {
  const [plants, setPlants] = useState<any[]>([]);
  const [plant, setPlant] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const loadPlants = async () => {
    setLoading(true);
    try {
      const plantsData = await getPlants();
      setPlants(plantsData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPlant = async (id: string) => {
    setLoading(true);
    try {
      const plantsData = await getPlants();
      const foundPlant = plantsData.find((p: any) => p.id === id);
      setPlant(foundPlant);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const addNewPlant = async (plantData: any) => {
    setLoading(true);
    try {
      let photoUri = plantData.photoUri;
      const newPlant = await addPlant({ ...plantData, photoUris: photoUri ? [photoUri] : [] });
      
      if (photoUri) {
        photoUri = await saveImage(photoUri, newPlant.id);
      }
      
      setPlants([...plants, { ...newPlant, photoUris: photoUri ? [photoUri] : [] }]);
      await scheduleWateringReminder(newPlant);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateExistingPlant = async (id: string, data: any) => {
    setLoading(true);
    try {
      await updatePlant(id, data);
      const updatedPlants = plants.map(p => p.id === id ? { ...p, ...data } : p);
      setPlants(updatedPlants);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const removePlant = async (id: string) => {
    setLoading(true);
    try {
      await deletePlant(id);
      const updatedPlants = plants.filter(p => p.id !== id);
      setPlants(updatedPlants);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { 
    plants, 
    plant,
    loading, 
    error, 
    loadPlants, 
    loadPlant,
    addPlant: addNewPlant, 
    updatePlant: updateExistingPlant, 
    deletePlant: removePlant 
  };
};
