import { useState } from 'react';
import { addContact, getContacts, getFavorites, getEmergencyContacts, updateContact, deleteContact } from '../database/contacts';

export const useContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);

  const loadContacts = async () => {
    const allContacts = await getContacts();
    const favoriteContacts = await getFavorites();
    const emergency = await getEmergencyContacts();
    setContacts(allContacts);
    setFavorites(favoriteContacts);
    setEmergencyContacts(emergency);
  };

  const addNewContact = async (name, phone, photo, isFavorite, isEmergency) => {
    const id = await addContact(name, phone, photo, isFavorite, isEmergency);
    await loadContacts();
    return id;
  };

  const updateExistingContact = async (id, data) => {
    await updateContact(id, data);
    await loadContacts();
  };

  const deleteExistingContact = async (id) => {
    await deleteContact(id);
    await loadContacts();
  };

  return {
    contacts,
    favorites,
    emergencyContacts,
    loadContacts,
    addNewContact,
    updateExistingContact,
    deleteExistingContact,
  };
};
