import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { db } from '../services/DeepLinkService';

const DeepLinkManager = () => {
  const [deepLinkCount, setDeepLinkCount] = useState(0);

  const createDeepLink = async () => {
    try {
      await db.insertDeepLink();
      setDeepLinkCount(deepLinkCount + 1);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View>
      <Text>Deep Link Manager</Text>
      <Button title="Create Deep Link" onPress={createDeepLink} />
      <Text>Deep Link Count: {deepLinkCount}</Text>
    </View>
  );
};

export default DeepLinkManager;
