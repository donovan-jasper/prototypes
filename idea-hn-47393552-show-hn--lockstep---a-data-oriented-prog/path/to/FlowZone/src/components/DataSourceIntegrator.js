import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import * as Contacts from 'expo-contacts';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

const DataSourceIntegrator = () => {
  const [contacts, setContacts] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const getContacts = async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync();
        setContacts(data);
      }
    };
    getContacts();

    const getPhotos = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        const { assets } = await MediaLibrary.getAssetsAsync();
        setPhotos(assets);
      }
    };
    getPhotos();

    const getFiles = async () => {
      const { status } = await FileSystem.requestPermissionsAsync();
      if (status === 'granted') {
        const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
        setFiles(files);
      }
    };
    getFiles();
  }, []);

  return (
    <View>
      <Text>Contacts:</Text>
      {contacts.map((contact, index) => (
        <Text key={index}>{contact.name}</Text>
      ))}
      <Text>Photos:</Text>
      {photos.map((photo, index) => (
        <Text key={index}>{photo.filename}</Text>
      ))}
      <Text>Files:</Text>
      {files.map((file, index) => (
        <Text key={index}>{file}</Text>
      ))}
    </View>
  );
};

export default DataSourceIntegrator;
