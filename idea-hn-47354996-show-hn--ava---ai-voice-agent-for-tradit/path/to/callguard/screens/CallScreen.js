import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CallScreening from '../components/CallScreening';

function CallScreen() {
  const navigation = useNavigation();
  const [callData, setCallData] = useState({});

  useEffect(() => {
    // Initialize call screening
    CallScreening.init();
  }, []);

  const handleScreenCall = () => {
    // Screen the call and get the transcript and summary
    CallScreening.screenCall().then((data) => {
      setCallData(data);
    });
  };

  return (
    <View>
      <Text>Call Screen</Text>
      <Button title="Screen Call" onPress={handleScreenCall} />
      <Text>Call Data: {JSON.stringify(callData)}</Text>
    </View>
  );
}

export default CallScreen;
