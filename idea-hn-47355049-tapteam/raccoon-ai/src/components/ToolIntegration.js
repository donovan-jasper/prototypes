import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import ToolIntegrationService from '../services/ToolIntegrationService';

const ToolIntegration = () => {
  const [data, setData] = useState('');

  const fetchData = (tool) => {
    ToolIntegrationService.fetchData(tool).then((response) => {
      setData(JSON.stringify(response, null, 2));
    });
  };

  return (
    <View>
      <Text>Tool Integration</Text>
      <Button title="Fetch Google Drive Data" onPress={() => fetchData('googleDrive')} />
      <Button title="Fetch Trello Data" onPress={() => fetchData('trello')} />
      <Button title="Fetch GitHub Data" onPress={() => fetchData('github')} />
      <Text>{data}</Text>
    </View>
  );
};

export default ToolIntegration;
