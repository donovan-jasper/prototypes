import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { db } from '../services/InstallService';

const InstallTracker = () => {
  const [installCount, setInstallCount] = useState(0);

  const trackInstall = async () => {
    try {
      await db.insertInstall();
      setInstallCount(installCount + 1);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View>
      <Text>Install Tracker</Text>
      <Button title="Track Install" onPress={trackInstall} />
      <Text>Install Count: {installCount}</Text>
    </View>
  );
};

export default InstallTracker;
